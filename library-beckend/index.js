const {
  ApolloServer,
} = require('apollo-server-express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('./models/user')
const { merge } = require('lodash')

const typeAuthor = require('./schemes/author')
const typeBook = require('./schemes/book')
const typeUser = require('./schemes/user')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
const MONGODB_URI = 'mongodb+srv://follstack:this_is_password@cluster0.9g99w.mongodb.net/Library?retryWrites=true&w=majority'

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

const typeDefs = [typeAuthor.typeDef, typeBook.typeDef, Mutation, Query, Subscription, typeUser.typeDef]
const resolvers = merge(typeAuthor.resolvers, typeBook.resolvers, typeUser.resolvers)

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