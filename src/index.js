const express = require('express');
const path = require('path');
const crypt = require('bcrypt');
const collection = require('./config');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

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
    res.render('home');
})
//register user
app.post('/signup', async (req, res) => {
    try {
        const data = {
            name: req.body.username,
            password: req.body.password
        };

        // consultar si el usuario ya existe
        const userdata = await collection.findOne({ name: data.name });
        if (userdata) {
            res.send('Usuario ya registrado');
        } else {
            // encriptar contraseña
            const saltRounds = 10;
            const hash = await crypt.hash(data.password, saltRounds);
            data.password = hash;

            await collection.insertMany(data);
            res.send('Usuario registrado');
        }
    } catch (error) {
        console.error(error);
        res.send('Error al registrar usuario');
    }
});


app.post('/login', async (req, res) => {
    try {
        const check = await collection.findOne({
            name: req.body.username
        });
        if (!check) {
            res.send('Usuario no encontrado');
        }
        const IsPasswordCorrect = await crypt.compare(req.body.password, check.password);
        if (!IsPasswordCorrect) {
            res.send('Contraseña incorrecta');
        }
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.send('Error al iniciar sesión');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

