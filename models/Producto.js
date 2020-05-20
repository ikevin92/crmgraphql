const { Schema, model } = require('mongoose');

const ProductosSchema = new Schema(
    {
        nombre: {
            type: String,
            require: true,
            trim: true,
        },
        existencia: {
            type: Number,
            require: true,
            trim: true,
        },
        precio: {
            type: Number,
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

// CREAMOS UN INDICE PARA LA BUSQUEDA AVANZADA
ProductosSchema.index({nombre: 'text'})

module.exports = model('Producto', ProductosSchema);
