const { Schema, model } = require('mongoose');

const PedidosSchema = new Schema(
    {
        pedido: {
            type: Array,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        cliente: {
            type: Schema.Types.ObjectId,
            ref: 'Cliente',
            required: true,
        },
        vendedor: {
            type: Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
        },
        estado: {
            type: String,
            default: 'PENDIENTE',
        },
        creado: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = model('Pedido', PedidosSchema);
