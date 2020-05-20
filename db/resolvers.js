// MODELOS
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

// importamos para hashear
const bcryptjs = require('bcryptjs');

// importamos json webtoken
const jwt = require('jsonwebtoken');

// importamos para traer la palabra secreta
require('dotenv').config({ path: 'variables.env' });

// funcion para crear token al momento de la autenticacion de usuario
const crearToken = (usuario, secreta, expiresIn) => {
    //console.log(usuario);
    // extraemos del usuario
    const { id, email, nombre, apellido } = usuario;

    return jwt.sign({ id, email, nombre, apellido }, secreta, { expiresIn });
};

//resolvers
// TODO LO DE SCHEMA DEBE ESTAR EN RESOLVERS/TYPEDEFS
const resolvers = {
    Query: {
        // COMPROBAMOS PANADOLE EL JWT NOS RETORNA EL ID
        obtenerUsuario: async (_, {}, ctx) => {
            //const usuarioId = await jwt.verify(token, process.env.SECRETA);
            console.log(ctx);

            return ctx.usuario;
        },

        // PRODUCTOS
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            console.log(id);
            // revisamos si el producto existe
            const producto = await Producto.findById(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            return producto;
        },

        // CLIENTES
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const clientesVendedor = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                console.log(clientesVendedor);
                console.log(typeof clientesVendedor);
                return clientesVendedor;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async (_, { id }, ctx) => {
            // revisar si el cliente existe
            const cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('cliente no encontrado');
            }

            // quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('no tienes las credenciales');
            }

            return cliente;
        },

        // PEDIDOS
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, { }, ctx) => {
            // usamos populate para los join poniendo el nombre del campo
            try {
                console.log(ctx.usuario.nombre);
                const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');
                console.log(pedidos)
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedido: async (_, { id }, ctx) => {
            console.log(id);
            // verificar si el pedido existe
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // solo quien lo creo puede verlo
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            // retorna el pedido
            return pedido;
        },
        obtenerPedidosEstado: async (_, { estado }, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

            return pedidos;
        },

        // AVANZADOS
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO' } },
                {
                    $group: {
                        _id: '$cliente',
                        total: { $sum: '$total' },
                    },
                },
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cliente',
                    },
                },
                {
                    $limit: 10,
                },
                // ordenamos
                {
                    $sort: { total: -1 },
                },
            ]);

            // retornamos
            return clientes;
        },
        mejoresVendedores: async () => {
            console.log('ENTRO A PEDIDO')
            const vendedores = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO' } },
                {
                    $group: {
                        _id: '$vendedor',
                        total: { $sum: '$total' },
                    },
                }, // mostramos cuanto vendio
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor',
                    },
                },
                // limitamos la cantidad de resultados
                {
                    $limit: 3,
                },
                // ordenamos
                {
                    $sort: { total: -1 },
                },
            ]);

            console.log(vendedores)

            return vendedores;
        },
        buscarProducto: async (_, { texto }) => {
            const productos = await Producto.find({ $text: { $search: texto } }).limit(10);
            return;

            return productos;
        },
    },
    Mutation: {
        // USUARIO
        nuevoUsuario: async (_, { input }) => {
            // extraemos email y password
            console.log(input);
            const { email, password } = input;

            // REVISAR SI EL USUARIO ESTA REGISTRADO
            const existeUsuario = await Usuario.findOne({ email });

            console.log(existeUsuario);

            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');
            }

            // HASHEAR PASSWORD
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            // GUARDARLO EN LA BD
            try {
                const usuario = new Usuario(input);
                usuario.save(); // guardarlo
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            // validar si el usuario existe
            const existeUsuario = await Usuario.findOne({ email });

            console.log(existeUsuario);

            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // validamos el password
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);

            console.log(passwordCorrecto);

            if (!passwordCorrecto) {
                throw new Error('El password es incorrecto');
            }

            // creamos el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h'),
            };
        },

        // PRODUCTOS
        nuevoProducto: async (_, { input }) => {
            console.log(input);
            try {
                const producto = new Producto(input);

                //almacenar en la bd
                const resultado = await producto.save();

                console.log(resultado);

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            console.log(id);
            // revisamos si el producto existe
            let producto = await Producto.findById(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            // guardarlo en la bd
            producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

            return producto;
        },
        eliminarProducto: async (_, { id }) => {
            // revisamos si el producto existe
            let producto = await Producto.findById(id);

            if (!producto) {
                throw new Error('Producto no encontrado');
            }
            // guardarlo en la bd
            producto = await Producto.findByIdAndDelete({ _id: id });

            return 'Producto eliminado';
        },

        // CLIENTES
        nuevoCliente: async (_, { input }, ctx) => {
            // verificar si el cliente esta registrado
            console.log(input);

            console.log(ctx);

            const { email } = input;

            const cliente = await Cliente.findOne({ email });
            if (cliente) {
                throw new Error('El cliente ya esta registrado');
            }

            const nuevoCliente = new Cliente(input);

            // asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            // guardarlo en la bd
            try {
                const resultado = await nuevoCliente.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarCliente: async (_, { id, input }, ctx) => {
            // verificiar si existe
            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('No existe el cliente en la bd');
            }

            // verificar si tiene permisos el vendedor
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('no tienes las credenciales');
            }

            // guardar cliente
            cliente = await Cliente.findOneAndUpdate({ _id: id }, input, { new: true });

            console.log(cliente)

            return cliente;
        },
        eliminarCliente: async (_, { id }, ctx) => {
            // verificiar si existe
            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('No existe el cliente en la bd');
            }

            // verificar si tiene permisos el vendedor
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('no tienes las credenciales');
            }

            // eliminar cliente
            await Cliente.findOneAndDelete({ _id: id });

            return 'cliente eliminado';
        },

        // PEDIDOS
        nuevoPedido: async (_, { input }, ctx) => {
            console.log(input);
            const { cliente } = input;

            console.log(typeof cliente);

            // verificamos si existe el cliente
            let clienteExiste = await Cliente.findById(cliente);

            console.log(clienteExiste);

            if (!clienteExiste) {
                throw new Error('No existe el cliente en la bd');
            }

            // verificar si el cliente es del vendedor
            if (clienteExiste.vendedor != ctx.usuario.id) {
                throw new Error('no tienes las credenciales');
            }

            // revisar si el stock esta disponible
            console.log(input.pedido);
            // recorremos el pedido con for asincrono
            for await (const articulo of input.pedido) {
                const { id } = articulo;

                const producto = await Producto.findById(id);

                if (articulo.cantidad > producto.existencia) {
                    throw new Error(`el articulo: ${producto.nombre} excede la cantidad disponible`);
                } else {
                    // actualizamos la cantidad disponible
                    producto.existencia = producto.existencia - articulo.cantidad;
                    // guardamos
                    await producto.save();
                }

                console.log(producto);
            }

            // Crear nuevo pedido
            const nuevoPedido = new Pedido(input);

            // asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            // guardarlo en la bd
            const resultado = await nuevoPedido.save();
            return resultado;
        },
        actualizarPedido: async (_, { id, input }, ctx) => {
            //extraemos el cliente
            const { cliente } = input;
            console.log(input)

            // si el pedido existe
            const existePedido = await Pedido.findById(id);
            if (!existePedido) {
                throw new Error('Pedido no existe en la bd');
            }

            // si el cliente existe
            const existeCliente = await Cliente.findById(cliente);
            if (!existeCliente) {
                throw new Error('Cliente no existe en la bd');
            }

            // si el cliente y pedido pertenece al vendedor
            if (existeCliente.vendedor != ctx.usuario.id) {
                throw new Error('no tienes las credenciales');
            }

            // revisar stock
            if (input.pedido) {
                //solamente en caso de que se le pase algo
                for await (const articulo of input.pedido) {
                    const { id } = articulo;

                    const producto = await Producto.findById(id);

                    if (articulo.cantidad > producto.existencia) {
                        throw new Error(`el articulo: ${producto.nombre} excede la cantidad disponible`);
                    } else {
                        // actualizamos la cantidad disponible
                        producto.existencia = producto.existencia - articulo.cantidad;
                        // guardamos
                        await producto.save();
                    }

                    console.log(producto);
                }
            }

            // guardar pedido
            const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, { new: true });
            return resultado;
        },
        eliminarPedido: async (_, { id }, ctx) => {
            // verificar si existe el pedido
            const pedido = await Pedido.findById(id);
            if (!pedido) {
                throw new Error('pedido no existe');
            }

            // verifiar si el vendedor es quien lo borra
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            // eliminar de la bd
            await Pedido.findOneAndDelete({ _id: id });

            return 'Pedido Eliminado';
        },
    },
};

// exportamos
module.exports = resolvers;
