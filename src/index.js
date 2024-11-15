const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const crypt = require('bcrypt');
const usermodel = require('./models/config');
const Project = require('./models/project');

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

app.post('/signup', async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password
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
// select user
app.get('/projects', async (req, res) => {
    // comprobar si hay session, si no no se puede acceder
   

    try {
        const users = await usermodel.find({},'name');
        const projects = await Project.find({}, 'name description startDate endDate createdAt userId image');
        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            return res.render('projects', {users, projects});
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
        // comprobar session con un console log
        req.session.userId = check._id;
        console.log(req.session);


        return res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.send('Error al iniciar sesión');
    }
});

app.post('/createproject', upload.single('projectimage'), async (req, res) => {
    try {
        const { projectname, projectdescription, startdate, enddate } = req.body;

        const newProject = new Project({
            name: projectname,
            description: projectdescription,
            startDate: new Date(startdate),
            endDate: new Date(enddate),
            createdAt: new Date(),
            userId: req.session.userId,  
            image: req.file ? `/uploads/${req.file.filename}` : null  
        });

        await newProject.save();
        res.redirect('/projects');  

    } catch (error) {
        console.error(error);
        res.send('Error al crear proyecto');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

