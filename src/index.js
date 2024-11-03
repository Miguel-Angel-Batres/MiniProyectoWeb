const express = require('express');
const path = require('path');
const crypt = require('bcrypt');
const collection = require('./config');
const e = require('express');

const app = express();
const PORT = 3000;
//convert data to json path.format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.render('login');
})
app.get('/signup', (req, res) => {
    res.render('signup');
})
//register user
app.post('/signup', async (req, res) => {
    try {
        
        const data = {
            email: req.body.email,
            password: req.body.password
        };
        // consultar si el usuario ya existe
        const userdata = await collection.findOne({ email: data.email });
        if (userdata) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }else{
        //encriptar contraseña
        const salt = await crypt.genSalt(10);
        const hashedPassword = await crypt.hash(data.password, salt);
        data.password = hashedPassword;
        //crear usuario
        const user = new collection(data);
        const result = await user.save();
        if (result) {
            console.log('User registered');
            res.redirect('/');
        } else {
            console.log('User not registered');
            res.redirect('/signup');
        }
    }   
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

//login user
app.post('/login', async (req, res) => {
    const data = {
        email: req.body.email,
        password: req.body.password
    }
    const userdata = await collection.findOne({ email: data.email });
    if (userdata) {
        crypt.compare(data.password, userdata.password, (err, result) => {
            if (result) {
                console.log('User logged in');
                res.redirect('/home');
            } else {
                console.log('User not found');
                res.redirect('/');
            }
        })
    } else {
        console.log('User not found');
        res.redirect('/');
    }
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

