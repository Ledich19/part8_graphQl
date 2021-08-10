const { UserInputError } = require("apollo-server-errors")
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'


const typeDef = `
type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  extend type Query {
      me: User
    }
    extend type Mutation {
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
    }
`
const resolvers = {
  
  Mutation: {
    createUser: async (root,args) => {
      const user = new User({...args})
      return user.save()
      .catch(error => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({username: args.username})
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  },
  Query: {
    me: (root, args, context) => {
      return context.currentUser
    },
  },
}
module.exports = {
  typeDef, resolvers
}
