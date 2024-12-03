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
            const [numprojects, numtasks, projects] = await Promise.all([
                Project.countDocuments({ creatorUserId: userId }),
                Task.countDocuments({ assignedUsers: userId }),
                Project.find({}, "assignedUsers").lean()
            ]);
            const totalUsers = projects.reduce((sum, project) => sum + project.assignedUsers.length, 0);
            return res.render('home', { numprojects, numtasks, totalUsers });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});



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
async function main() {
     try {
     
    //   const existingUser = await usermodel.findOne({ name: 'admin' });
    //   const newUser = new usermodel({
    //     name: 'admin',
    //     password: 'admin',
    //     img: null
    //   });
    //   if (existingUser) {
    //     console.log('Ya existe un usuario con este nombre.');
    //   }else{
    //   await newUser.save();
    //  }
   
    //  const newProject = new Project({
    //     name: 'Proyecto 1',
    //     description: 'Descripción del proyecto 1',
    //     startDate: new Date(2024, 11, 20),
    //     endDate: new Date(2030, 11, 20),
    //     createdAt: new Date(),
    //     creatorUserId: newUser._id,
    //     assignedUsers: [
    //       { userId: newUser._id, role: 'admin' }
    //     ],
    //     image: null
    //   });
    //   const existingProject = await Project.findOne({ name: 'Proyecto 1' });
    //   if (existingProject) {
    //     console.log('Ya existe un proyecto con este nombre.');    
    //   }else{
    //     await newProject.save();
    //   }
  
    //   const newTask = new Task({
    //     name: 'Tarea 1',
    //     description: 'Descripción de la tarea 1',
    //     enddate: new Date(2024, 11, 20),
    //     status: 'not started',
    //     priority: 'high',
    //     projectId: newProject._id,
    //     assignedUsers: [
    //       newUser._id
    //     ]
    //   });
    //   const existingTask = await Task.findOne({ name: 'Tarea 1' });
    //   if (existingTask) {
    //     console.log('Ya existe una tarea con este nombre.');    
    //   }else{
    //     await newTask.save();
    //   }
    //   console.log('Todos los datos se han guardado correctamente.');
    //   await usermodel.deleteOne({ name: 'admin' }); 
    //   await Project.deleteOne({ name: 'Proyecto 1' }); 
    //   await Task.deleteOne({ name: 'Tarea 1' }); 
    //   console.log('Documentos eliminados correctamente.');

    //   modificar los 3 documentos
    //   const user = await usermodel.findOne({ name: 'admin' });
    //   user.name = 'admin2';
    //   await user.save();
    //   const project = await Project.findOne({ name: 'Proyecto 1' });
    //   project.name = 'Proyecto 2';
    //   await project.save();
    //   const task = await Task.findOne({ name: 'Tarea 1' });
    //   task.name = 'Tarea 2';
    //   await task.save();
    //     console.log('Documentos modificados correctamente.');   

    // ver las colecciones de la base de datos con los nuevos datos
    // const users = await usermodel.find({name: 'admin2'},'name');
    // const projects = await Project.find({name: 'Proyecto 2'},'name');
    // const tasks = await Task.find({name: 'Tarea 2'},'name');
    // console.log('Usuarios:', users);
    // console.log('Proyectos:', projects);
    // console.log('Tareas:', tasks);
    // const users = await usermodel.find({}, 'name email -_id');
    // console.log('Usuarios:', users);

    // const highprioritytasks = await Task.find({ priority: 'high' },
    //  'name description enddate status priority projectId assignedUsers -_id');
    // console.log('Tareas con prioridad alta:', highprioritytasks);

    // projectos en donde el usuario con nombre miguel es miembro
    
    // //populate para obtener el nombre del usuario
    // const projects = await Project.find({}, 'name description assignedUsers -_id') 
    // .populate('assignedUsers.userId', 'name'); 
    // //filtrar los proyectos donde miguel es miembro
    // const userProjects = projects.filter(project => 
    // project.assignedUsers.some(member => member.userId && member.userId.name === 'miguel')
    // );
    // //obtener solo los nombres de los proyectos
    // const projectNames = userProjects.map(project => project.name);
    // console.log('Proyectos donde Miguel es miembro:', projectNames);

    // tareas con status completed del usuario leonardo
    // const tasks = await Task.find({ status: 'completed' }, 'name description enddate status priority projectId assignedUsers -_id')
    // .populate('assignedUsers', 'name');
    // const userTasks = tasks.filter(task => task.assignedUsers.some(user => user.name === 'leonardo'));
    // console.log('Tareas completadas de Leonardo:', userTasks);

    // const projects = await Project.find({ createdAt: { $gt: new Date('2024-11-20') } },
    //  'name description startDate endDate -_id');
    // console.log('Proyectos con fecha mayor a 2024-11-20: ' + projects);

    // const projectUserCount = await Project.aggregate([
    //     { $unwind: "$assignedUsers" },
    //     { $group: { 
    //       _id: "$_id",              
    //       userCount: { $sum: 1 }     
    //     }}
    //   ]);
    //   console.log(projectUserCount);

    //  const taskPriorityCount = await Task.aggregate([
    //     { $group: { 
    //       _id: "$priority",         
    //       taskCount: { $sum: 1 }   
    //     }}
    //   ]);
      
    //   console.log(taskPriorityCount);

    // esta consulta agrupa los proyectos por su _id y cuenta la cantidad de usuarios asignados a cada uno.
    
    // const projectUserCount = aSwait Project.aggregate([
    //   { $unwind: "$assignedUsers" },
    //   { $group: { 
    //     _id: "$_id",              
    //     userCount: { $sum: 1 }   
    //   }}
    // ]);
    
    // console.log(projectUserCount);
    

    
    // esta consulta agrupa las tareas por su priority y cuenta la cantidad de tareas en cada prioridad.
    
    // const taskPriorityCount = await Task.aggregate([
    //   { $group: { 
    //     _id: "$priority",         
    //     taskCount: { $sum: 1 }    
    //   }}
    // ]);
    
    // console.log(taskPriorityCount);
    
  
    
    // Agrupa los proyectos por creatorUserId (el ID del creador) y cuenta la cantidad de proyectos que ha creado cada usuario.
    
    // const userProjectCount = await Project.aggregate([
    //   { $group: { 
    //     _id: "$creatorUserId",     
    //     projectCount: { $sum: 1 }   
    //   }}
    // ]);
    
    // console.log(userProjectCount);
    
    // esta consulta obtiene el número total de tareas por cada usuario asignado:
    
    // const userTaskCount = await Task.aggregate([
    //   { $unwind: "$assignedUsers" }, 
    //   { $group: { 
    //     _id: "$assignedUsers",      
    //     taskCount: { $sum: 1 }       
    //   }}
    // ]);
    //  console.log(userTaskCount);
    
  
    
    // esta consulta agrupa los proyectos que tienen tareas con un estado específico (por ejemplo, "completed") y cuenta la cantidad de tareas con ese estado en cada proyecto.
    
    // const projectTaskStatusCount = await Project.aggregate([
    //   { 
    //     $lookup: { 
    //       from: "tasks",          
    //       localField: "_id",      
    //       foreignField: "projectId",
    //       as: "tasks"              
    //     }
    //   },
    //   { $unwind: "$tasks" },            
    //   { $match: { "tasks.status": "completed" } },
    //   { $group: { 
    //     _id: "$_id",                  
    //     completedTaskCount: { $sum: 1 } 
    //   }}
    // ]);
    
    // // console.log(projectTaskStatusCount);
    // const userProjectCount = await Project.aggregate([
    //     { $group: { 
    //       _id: "$creatorUserId",     
    //       projectCount: { $sum: 1 } 
    //     }}
    //   ]);
    

    // const result = await Task.aggregate([
    //     {$group: {_id: '$projectId', totalTasks: { $sum: 1 }}},
    //     {
    //       $lookup: {
    //         from: 'projects',
    //         localField: '_id',
    //         foreignField: '_id',
    //         as: 'projectDetails' 
    //       }
    //     },
    //     {
    //       $project: {
    //         _id: 0, 
    //         projectName: { $arrayElemAt: ['$projectDetails.name', 0] }, 
    //         totalTasks: 1 
    //       }
    //     }
    //   ]);
      
    //   console.log(result);
      


    // const result = await Project.aggregate([
    //     { $unwind: "$assignedUsers" },
    //     { $group: { 
    //       _id: "$name",              
    //       userCount: { $sum: 1 }     
    //     }},
    //     { $group: {_id: null, avgUsers: { $avg: "$userCount" }}},
    //     { $project: { _id: 0, avgUsers: 1 }}

    //   ]);
      
    //   console.log(result);
      
      
      
      

    } catch (error) {
      console.error('Error al guardar los datos:', error);
    }
  }
    // main();  
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
// metodos add
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
        const newTask = new Task({
            name: taskname,
            description: taskdescription,
            enddate: new Date(taskdate),
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
});
