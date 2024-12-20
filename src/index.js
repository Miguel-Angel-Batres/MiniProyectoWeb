const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const crypt = require('bcrypt');
const usermodel = require('./models/config');
const Project = require('./models/project');
const Task = require('./models/tasks');

const app = express();
const PORT = 5000;
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.get('/', (req, res) => {
    res.render('login');
})
app.get('/signup', (req, res) => {
    res.render('signup');
})
app.get('/login', (req, res) => {
    
    res.render('login');
})
app.get('/projects/:id', async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await Project.findById(projectId)
        .populate('assignedUsers.userId', 'name img');
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project); 
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/profile', async (req, res) => {
    try {
     
      res.json({ success: true, redirectUrl: '/settings?profile=true' }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error en la obtención de perfil' });
    }
  });
  
app.get('/profile/settings', async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
            }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        }
});
app.get('/home', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        } else {
            const userId = req.session.userId; 
            const [numprojects, numtasks] = await Promise.all([
                Project.countDocuments({ creatorUserId: userId }),
                Task.countDocuments({ assignedUsers: userId }),
            ]);
            const userscount = await usermodel.countDocuments();
            return res.render('home', { numprojects, numtasks, userscount });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

async function main(){
    try {
        const nombresusuarios = await usermodel.find({}, 'name -_id');
        console.log(nombresusuarios);
    } catch (error) {
        console.error(error);
    }
}
main();

app.post('/signup',upload.single('userimg'), async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password,
            email: req.body.email,
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
            return res.json({ success: false, message: 'Usuario no encontrado' });
        }
        const IsPasswordCorrect = await crypt.compare(req.body.password, check.password);
        if (!IsPasswordCorrect) {
            return res.json({ success: false, message: 'Contraseña incorrecta' });
        }
        req.session.userId = check._id;
        res.json({ success: true, message: 'Inicio de sesión correcto' });

    } catch (error) {
        console.error(error);
        res.send('Error al iniciar sesión');
    }
});

// metodos update
app.get('/update/start/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        task.status = 'incompleted';
        await task.save();
        res.redirect('/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar tarea');
    }
});
app.get('/update/complete/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        task.status = 'completed';
        await task.save();
        res.redirect('/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar tarea');
    }
});
// settings update
app.post('/changeprojectname', async (req, res) => {
    try {
        const { projectId, newprojectname } = req.body;
        const project = await
        Project .findById(projectId);
        project.name = newprojectname;
        await project.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar nombre de proyecto');
    }
});
app.post('/changeprojectdescription', async (req, res) => {
    try {
        const { projectId, newprojectdescription } = req.body;
        const project = await Project.findById(projectId);
        project.description = newprojectdescription;
        await project.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar descripción de proyecto');
    }
});
app.post('/changeprofileimage'), upload.single('userimg'), async (req, res) => {
    try {
        const user = await usermodel.findById(req.session
            .userId);
        user.img = req.file ? `/uploads/${req.file.filename}` : null;
        await user.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar imagen de usuario');
    }
};
app.post('/inviteuser', async (req, res) => {
    try {
        const { projectId, username} = req.body;
        const project = await Project.findById(projectId).populate('assignedUsers.userId');
        const userExists = project.assignedUsers.some(user => user.userId.name === username);

        if (userExists) {
            return res.send('Usuario ya asignado');
        }else{
            const user = await usermodel.findOne({ name: username });
            if (!user) {
                return res.send('Usuario no encontrado');
            }
            project.assignedUsers.push({
                userId: user._id,
                role: 'miembro'
            });
            await project.save();
            res.redirect('/settings');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al invitar usuario');
    }
});

async function main(){
    try {
        //funcion 1 
        const usermiguel = await usermodel.findOne({ name: 'miguel' }, 'name _id');
        console.log(usermiguel);
        //funcion 2
        const nuevousuario = new usermodel({ name: 'luis', password: '1234' });
        await nuevousuario.save();
        //funcion 3
        const usuariostotales = await usermodel.countDocuments();
        console.log(usuariostotales);
        //funcion 4
        const actualizarusuario = await usermodel.updateOne({ name: 'miguel' }, { name: 'miguelito' });
        console.log(actualizarusuario);
        //funcion 5
        const proyectos = await Project.find({}, 'name -_id');
        console.log(proyectos);
        
        
    } catch (error) {
        console.error(error);
    }
}
main();
app.post('/makeadmin', async (req, res) => {
    try {
        const { projectId, username } = req.body;
        const userId = await usermodel.findOne({ name: username });
        if(!userId){
            return res.send('Usuario no encontrado');
        }
        const project = await Project.findById(projectId);
        const user = project.assignedUsers.find(user => user.userId.toString() === userId._id.toString());
        user.role = 'admin';        
        await project.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al hacer admin');
    }
});
app.post('/projects/:projectId/removeadmin', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;
        const project = await Project.findById(projectId);
        
        const usersessionrole = project.assignedUsers.find(user => user.userId.toString() === req.session.userId);
        console.log(usersessionrole);
        if(usersessionrole.role !== 'admin'){
             return res.json({ success: false, message: "No tienes permisos para eliminar admin" });
        }
        if (project.creatorUserId.toString() === userId) {
            return res.json({ success: false, message: "Cannot remove the project's creator" });
        }
        const user = project.assignedUsers.find(user => user.userId.toString() === userId);
        user.role = 'miembro';
        await project.save();
        return res.json({ success: true, message: 'Admin eliminado correctamente' });


        } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar admin');
    }
});
app.post('/deleteproject', async (req, res) => {
    try {
        const { projectId } = req.body;
        await Project.findByIdAndDelete(projectId);
        // eliminar tareas del proyecto
        await Task.deleteMany({ projectId });

        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar proyecto');
    }
});
app.post('/projects/:projectId/removeuser', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;
        const project = await Project.findById(projectId);
        
        if (project.creatorUserId.toString() === userId) {
            return res.json({ success: false, message: "Cannot remove the project's creator" });
        }

        project.assignedUsers = project.assignedUsers.filter(user => user.userId.toString() !== userId);
        await Task.updateMany({ projectId, assignedUsers: userId }, { $pull: { assignedUsers: userId } });

        await Task.deleteMany({ projectId, assignedUsers: [] });
        await project.save();

        
        return res.json({ success: true, message: 'User removed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error at user delete');
    }
});



app.post('/changeprofilename', async (req, res) => {
    try {
        const { newusername } = req.body;
        const user = await usermodel.findById(req.session
            .userId);
        user.name = newusername;
        await user.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar nombre de usuario');
    }   
});
app.post('/changeprofilepassword', async (req, res) => {
    try {
        // comprobar antigua contraseña
        const user = await usermodel.findById(req.session
            .userId);
        const IsPasswordCorrect = await crypt.compare(req.body.oldpassword, user.password);
        if (!IsPasswordCorrect) {
            return res.send('Contraseña incorrecta');
        }else{
            // encriptar nueva contraseña
            const saltRounds = 10;
            const hash = await crypt.hash(req.body.newpassword, saltRounds);
            user.password = hash;
            await user.save();
            res.redirect('/settings');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar contraseña');
    }
});

app.post('/changeprojectimage', upload.single('projectimage'), async (req, res) => {
    try {
        const { projectId } = req.body;
        const project = await
        Project .findById(projectId);
        project.image = req.file ? `/uploads/${req.file.filename}` : null;
        await project.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar imagen de proyecto');
    }
});
app.post('/changeprofileimage', upload.single('profileimage'), async (req, res) => {
    try {
        const user = await usermodel.findById(req.session
            .userId);
        user.img = req.file ? `/uploads/${req.file.filename}` : null;
        await user.save();
        res.redirect('/settings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar imagen de usuario');
    }
});
     
// metodos add
app.post('/createproject', upload.single('projectimage'), async (req, res) => {
    try {
        const { projectname, projectdescription, startdate, enddate } = req.body;
        const assignedUsers = req.body.usuarios;

        const userArray = Array.isArray(assignedUsers) ? assignedUsers : [assignedUsers];
        const startDateformatted = new Date(startdate.split('T')[0]);
        const endDateformatted = new Date(enddate.split('T')[0]);
        const userArrayIds = await usermodel.find({ name: { $in: userArray } }, '_id');
        // eliminar usuarios duplicados
        const uniqueUserArrayIds = userArrayIds.filter((user, index, self) => index === self.findIndex(t => t.name === user.name));
        const assignedUsersWithRoles = [
           
            ...uniqueUserArrayIds.map(userId => ({ //asignar primero los miembros
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
        const userArrayIds = await usermodel.find({ name: { $in: userArray } }, '_id');
        // eliminar usuarios duplicados
        const uniqueUserArrayIds = userArrayIds.filter((user, index, self) => index === self.findIndex(t => t.name === user.name));
        const newTask = new Task({
            name: taskname,
            description: taskdescription,
            enddate: new Date(taskdate),
            status: 'not started',
            priority: priority,
            projectId: projectId,
            assignedUsers: uniqueUserArrayIds,
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
app.get('/tasks/user/:selectedoption', async (req, res) => {
    try {
        const { selectedoption } = req.params;
        const tasks = await Task.find({}, 'name description enddate status priority projectId assignedUsers').populate('assignedUsers', 'name img');
        const projecttasks = tasks.filter(task => task.projectId.toString() === selectedoption);
        const filteredtasks = projecttasks.filter(task => task.assignedUsers.some(user => user._id.toString() === req.session.userId));
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
        const users = await usermodel.find({}, 'name');
        // mandar proyectos 
        const projects = await Project.find({ assignedUsers: { $elemMatch: { userId: req.session.userId } } }, 
            'name description startDate endDate createdAt creatorUserid assignedUsers image')
            .populate({
                path: 'assignedUsers.userId', 
                select: 'name', 
              })
              .exec();
        

        if (!req.session.userId) {
            return res.redirect('/login');
        }else{
            return res.render('settings', {user,projects,users});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener usuario');
    }
});
app.get('/settings/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = await Project.findById(projectId).populate('assignedUsers.userId');
        if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const assignedUserIds = project.assignedUsers.map(user => user.userId._id.toString());
        const users = await usermodel.find({ _id: { $nin: assignedUserIds } });
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener proyecto');
    }
});

 