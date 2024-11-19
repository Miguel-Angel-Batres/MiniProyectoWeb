const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const crypt = require('bcrypt');
const usermodel = require('./models/config');
const Project = require('./models/project');
const Task = require('./models/tasks');

const app = express();
const PORT = 3000;
app.use(session({
    secret: 'lol',  
    resave: false,         
    saveUninitialized: false, 
    cookie: { secure: false }  
}));

const upload = multer({ dest : 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

  
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.render('login');
})
app.get('/signup', (req, res) => {
    res.render('signup');
})
app.get('/login', (req, res) => {
    
    res.render('login');
})
app.get('/home', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }else{
        return res.render('home');
    }
})

app.get('/tasks', (req, res) => {
    // comprobar si hay session, si no no se puede acceder
    if (!req.session.userId) {
        return res.redirect('/login');
    }else{
        return res.render('tasks');
    }
})  

app.post('/signup',upload.single('userimg'), async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password,
            img: req.file ? `/uploads/${req.file.filename}` : null  
        };

        // consultar si el usuario ya existe
        const userdata = await usermodel.findOne({ name: data.name });
        if (userdata) {
            res.send('Usuario ya registrado');
        } else {
            // encriptar contraseña
            const saltRounds = 10;
            const hash = await crypt.hash(data.password, saltRounds);
            data.password = hash;

            await usermodel.insertMany(data);
            res.send('Usuario registrado');
        }
    } catch (error) {
        console.error(error);
        res.send('Error al registrar usuario');
    }
});
app.get('/projects', async (req, res) => {

    try {
        const users = await usermodel.find({},'_id name ');
        const projects = await Project.find({}, 'name description startDate endDate createdAt creatorUserid assignedUsers image')
        .populate('assignedUsers.userId', '_id name img');
        const tasks = await Task.find({}, 'name description enddate priority projectId assignedUsers');
        
        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            return res.render('projects', {users, projects, tasks});
        }
        
    } catch (error) {
        console.error(error);
        res.send('Error al obtener usuarios');
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await usermodel.findOne({
            name: req.body.username
        });
        if (!check) {
            return res.send('Usuario no encontrado');
        }
        const IsPasswordCorrect = await crypt.compare(req.body.password, check.password);
        if (!IsPasswordCorrect) {
            return res.send('Contraseña incorrecta');
        }
        req.session.userId = check._id;


        return res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.send('Error al iniciar sesión');
    }
});

app.post('/createproject', upload.single('projectimage'), async (req, res) => {
    try {
        const { projectname, projectdescription, startdate, enddate } = req.body;
        const assignedUsers = req.body.usuarios;

        const userArray = Array.isArray(assignedUsers) ? assignedUsers : [assignedUsers];

        const assignedUsersWithRoles = [
           
            ...userArray.map(userId => ({
                userId,
                role: 'miembro'  // El resto de los usuarios son "miembro"
            })),
            {
                userId: req.session.userId, // El creador del proyecto
                role: 'admin'
            }
        ];


        const newProject = new Project({
            name: projectname,
            description: projectdescription,
            startDate: new Date(startdate),
            endDate: new Date(enddate),
            createdAt: new Date(),
            creatorUserId: req.session.userId,
            assignedUsers: assignedUsersWithRoles, 
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await newProject.save();
        res.redirect('/projects');  

    } catch (error) {
        console.error(error);
        res.send('Error al crear proyecto');
    }
});

app.post('/createtask', async (req, res) => {
    try {
        const { taskname, priority, taskdescription, taskdate, projectId } = req.body;
        const assignedUsers = req.body.search_usuarios;
        
        const userArray = Array.isArray(assignedUsers) ? assignedUsers : [assignedUsers];

        const newTask = new Task({
            name: taskname,
            description: taskdescription,
            enddate: new Date(taskdate),
            priority: priority,
            projectId: projectId,
            assignedUsers: userArray,
        });

        await newTask.save();
        res.redirect('/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear tarea');
    }
});
app.get('/tasks/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ projectId }).populate('assignedUsers', 'name img');
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener tareas');
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/members/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await  Project.findById(projectId).populate('assignedUsers.userId', 'name img');
        res.json(project.assignedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener miembros');
    }
});