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
app.get('/home', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            const numprojects =  await Project.countDocuments({ creatorUserId: req.session.userId });
            const numtasks = await Task.countDocuments({ assignedUsers: req.session.userId });
            //usuarios registrados en todos mis proyectos   
            const projects = await Project.find({}, "assignedUsers"); 
            const totalUsers = projects.reduce((sum, project) => sum + project.assignedUsers.length, 0);
            return res.render('home', {numprojects, numtasks, totalUsers});
        }
        
    } catch (error) {
        console.error(error);
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
        const startDateformatted = new Date(startdate.split('T')[0]);
        const endDateformatted = new Date(enddate.split('T')[0]);

        const assignedUsersWithRoles = [
           
            ...userArray.map(userId => ({ //asignar primero los miembros
                userId,
                role: 'miembro' 
            })),
            {
                userId: req.session.userId, // asignar despues el creador como admin
                role: 'admin'
            }
        ];


        const newProject = new Project({
            name: projectname,
            description: projectdescription,
            startDate: startDateformatted,
            endDate: endDateformatted,
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
        const formattedDate = taskdate.toISOString().split('T')[0]
        const newTask = new Task({
            name: taskname,
            description: taskdescription,
            enddate: formattedDate,
            status: 'not started',
            priority: priority,
            projectId: projectId,
            assignedUsers: userArray,
        });

        await newTask.save();
        res.redirect('/projects');
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
app.get('/tasks', async (req, res) => {
    try{
        const projects = await Project.find({ }, 
            'name');
        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            res.render('tasks', {projects});
        }
    } catch (error) {
        console.error(error);
    }
});
// fetch to get tasks by project id and filter by user.session
app.get('/tasks/user/:selectedoption', async (req, res) => {
    try {
        const { selectedoption } = req.params;
        const tasks = await Task.find({}, 'name description enddate status priority projectId assignedUsers').populate('assignedUsers', 'name img');
        tasks.filter(task => task.projectId.toString() === selectedoption);
        const filteredtasks = tasks.filter(task => task.assignedUsers.some(user => user._id.toString() === req.session.userId));

        res.json(filteredtasks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener tareas');
    }
});
app.get('/alltasks', async (req, res) => {
    try {
        const tasks = await Task.find({}, 'name description enddate status priority projectId assignedUsers').populate('assignedUsers', 'name img');
        const filteredtasks = tasks.filter(task => task.assignedUsers.some(user => user._id.toString() === req.session.userId));
        res.json(filteredtasks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener tareas');
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error al cerrar sesión');
      }
      res.redirect('/login');  
    });
  });
3
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
app.get('/task/delete/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        //delete task
        await Task.findByIdAndDelete(taskId);
         res.redirect('/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener tarea');
    }
});
app.get('/settings', async (req, res) => {
    try {
        
        const user = await usermodel.findById(req.session.userId);
        // mandar proyectos 
        const projects = await Project.find({ creatorUserId: req.session.userId }, 
            'name description startDate endDate createdAt creatorUserid assignedUsers image');

        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            return res.render('settings', {user,projects});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuario');
    }
})