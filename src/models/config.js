const mongoose = require('mongoose');

const uri = "mongodb+srv://maleficarius:pepito@cluster0.agbh4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => {
        console.error("Error de conexión:", error);
        process.exit(1); 
    });
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false
    }
});

const usermodel = new mongoose.model('User', schema);

module.exports = usermodel;
