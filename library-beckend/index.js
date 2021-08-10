const {
  ApolloServer,
} = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('./models/user')
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
const MONGODB_URI = 'mongodb+srv://follstack:this_is_password@cluster0.9g99w.mongodb.net/Library?retryWrites=true&w=majority'

const typeAuthor = require('./schemes/author')
const typeBook = require('./schemes/book')
const typeToken = require('./schemes/token')
const typeUser = require('./schemes/user')

const { merge } = require('lodash')

const {
  createServer
} = require('http')
const {
  execute
} = require('graphql')
const {
  subscribe
} = require('graphql')
const {
  SubscriptionServer
} = require('subscriptions-transport-ws')
const {
  makeExecutableSchema
} = require('@graphql-tools/schema')
const express = require('express')

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })
mongoose.set('debug', true);
// let authors = [
//   {
//     name: 'Robert Martin',
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: 'Martin Fowler',
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963
//   },
//   {
//     name: 'Fyodor Dostoevsky',
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821
//   },
//   { 
//     name: 'Joshua Kerievsky', // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   { 
//     name: 'Sandi Metz', // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's name in the context of the book instead of the author's id
 * However, for simplicity, we will store the author's name in connection with the book
 */

// let books = [
//   {
//     title: 'Clean Code',
//     published: 2008,
//     author: 'Robert Martin',
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Agile software development',
//     published: 2002,
//     author: 'Robert Martin',
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ['agile', 'patterns', 'design']
//   },
//   {
//     title: 'Refactoring, edition 2',
//     published: 2018,
//     author: 'Martin Fowler',
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring']
//   },
//   {
//     title: 'Refactoring to patterns',
//     published: 2008,
//     author: 'Joshua Kerievsky',
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'patterns']
//   },  
//   {
//     title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
//     published: 2012,
//     author: 'Sandi Metz',
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ['refactoring', 'design']
//   },
//   {
//     title: 'Crime and punishment',
//     published: 1866,
//     author: 'Fyodor Dostoevsky',
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ['classic', 'crime']
//   },
//   {

//   },
// ]

const Query = `
type Query {
  _empty: String
  }
  `
const Mutation = `
type Mutation {
  _empty: String
  }
`
const Subscription = `
type Subscription {
    _empty: String
  }
`


const typeDefs = [typeAuthor.typeDef, typeBook.typeDef, Mutation, Query, Subscription, typeToken.typeDef, typeUser.typeDef]
const resolvers = merge(typeAuthor.resolvers, typeSubscription.resolvers, typeBook.resolvers, typeUser.resolvers)
async function startApolloServer(typeDefs, resolvers) {
  const app = express()
  const httpServer = createServer(app)

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const server = new ApolloServer({
    schema,
    context: async ({
      req
    }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7), JWT_SECRET
        )
        const currentUser = await User.findById(decodedToken.id)
        return {
          currentUser
        }
      }
    }
  })
  await server.start();

  server.applyMiddleware({
    app,
    path: '/'
  });


  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
  }, {
    server: httpServer,
    path: `${server.graphqlPath}graphql`,
  });

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => subscriptionServer.close());
  });

  await new Promise(resolve => httpServer.listen({
    port: 4000
  }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

}

startApolloServer(typeDefs, resolvers)