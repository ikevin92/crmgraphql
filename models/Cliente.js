const { Schema, model } = require('mongoose');

const ClientesSchema = new Schema(
    {
        nombre: {
            type: String,
            require: true,
            trim: true,
            uppercase: true,
        },
        apellido: {
            type: String,
            require: true,
            trim: true,
        },
        empresa: {
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
        telefono: {
            type: String,
            trim: true,
        },
        // foreign key con el usuario
        vendedor: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
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


module.exports = model('Cliente', ClientesSchema);