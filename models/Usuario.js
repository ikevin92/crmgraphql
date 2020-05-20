const { Schema, model } = require('mongoose');

// inicializamos el schema
const UsuariosSchema = new Schema(
    {
        nombre: {
            type: String,
            require: true,
            trim: true,
        },
        apellido: {
            type: String,
            require: true,
            trim: true,
        },
        email: {
            type: String,
            require: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
            trim: true,
        },
        //PODEMOS USAR TIMESTAMP DEL CURSO DE FAZT
        creado: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = model('Usuario', UsuariosSchema);
