const Author = require('../models/Author')


const typeDef = `
type Author {
    name: String!
    born: Int
    id: ID!
    books: [Book!]!
    bookCount: Int
  }

  extend type Query {
      bookCount: Int
      authorCount: Int!
      allAuthors: [Author!]!
    }

  extend type Mutation {
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
  `
const resolvers = {
  Mutation: {
    editAuthor: async (root, args,context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
    const author = await Author.findOne({name: args.name})
    author.born = args.setBornTo
    try {
      await author.save()
    } 
    catch(error) {
      throw new UserInputError(error.message, {
        invalidArgs: args,
      })
    }
    return author
    },
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allAuthors: () => Author.find({}).populate('books'),
  },
  Author: {
    bookCount: (root) => {
      return root.books.length
    }
  },
}
module.exports = {
  typeDef, resolvers
}