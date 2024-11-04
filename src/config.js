const mongoose = require('mongoose');

const uri = 'mongodb+srv://maleficarius:123ferderios45@cluster0.agbh4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri)
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => {
        console.error("Error de conexión:", error);
        process.exit(1); // Detiene el proceso en caso de error
    });
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = new mongoose.model('users', schema);

module.exports = collection;
