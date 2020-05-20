// IMPORTAMOS APOLLO Y GQL
const { ApolloServer, gql } = require('apollo-server');
// importamos los typeDefs y resolvers
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

// importamos bd
const conectarDB = require('./config/db');

// importamos json webtoken
const jwt = require('jsonwebtoken');

// CONECTAMOS LA BD
conectarDB();

// SERVIDOR
const server = new ApolloServer({
    // pasamos el type y los resolvers
    typeDefs,
    resolvers,
    // mantenemos el usuario en el context
    context: ({ req }) => {
        //console.log(req.headers['authorization'])

        console.log(req.headers);

        // validamos que tenga un token en caso tal pasamos un string vacio
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                //console.log(usuario);
                return { usuario };
            } catch (error) {
                console.log('hubo un error');
                console.log(error);
            }
        }
    },
});

//ARRANCAR EL SERVIDOR

// para el deployment debemos cambiar el puerto
server.listen({port: process.env.PORT || 4000}).then(({ url }) => {
    console.log(`servidor listo en el URL ${url}`);
});
