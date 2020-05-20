// IMPORTAMOS APOLLO Y GQL
const { gql } = require('apollo-server');

//SCHEMA
const typeDefs = gql`
    # TYPES

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
        createdAt: String
        updatedAt: String
    }

    type Token {
        token: String
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        creado: String
        createdAt: String
        updatedAt: String
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
    }

    # DEFINIMOS LOS TYPES PARA PEDIDO
    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        fecha: String
        estado: EstadoPedido
    }

    type PedidoGrupo {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    # AVANZADOS
    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [Usuario]
    }

    # INPUTS

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        email: String!
        empresa: String!
        telefono: String
    }

    # PEDIDO INPUT
    input PedidoProductoInput {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        cliente: ID
        estado: EstadoPedido
    }

    # DEFINIMOS LOS TIPOS DE PEDIDO
    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    # QUERYS

    type Query {
        # USUARIOS
        obtenerUsuario: Usuario

        # PRODUCTOS
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto

        # CLIENTES
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente

        # PEDIDOS
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]

        # BUSQUEDAS AVANZADAS
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]
        buscarProducto(texto: String!): Producto
    }

    # MUTATIONS

    type Mutation {
        # USUARIOS
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token

        # PRODUCTOS
        nuevoProducto(input: ProductoInput): Producto
        actualizarProducto(id: ID!, input: ProductoInput): Producto
        eliminarProducto(id: ID!): String

        # CLIENTES
        nuevoCliente(input: ClienteInput): Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!): String

        # PEDIDOS
        nuevoPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, input: PedidoInput): Pedido
        eliminarPedido(id: ID!): String
    }
`;

// EXPORTAMOS LA CLASES
module.exports = typeDefs;
