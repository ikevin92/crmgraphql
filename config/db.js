const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

// METODO PARA INICIAR LA BD
const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO_ATLAS, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });

        console.log('CONECTADO A LA BD');
    } catch (error) {
        console.log('HUBO UN ERROR CON LA BD');
        console.log(error);
        process.exit(1); //detenemos la app
    }
};

module.exports = conectarDB;
