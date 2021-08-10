const { UserInputError } = require('apollo-server-errors')

const Book = require('../models/book')
const Author = require('../models/Author')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()


const typeDef = `
type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]!
  }
   extend type Query {
    allBooks(author: String, genre: String): [Book!]!
  }
  extend type Mutation {
    addBook(
      title: String!,
      published: Int!,
      author: String!,
      genres: [String!]!
    ): Book
    }
    extend type Subscription {
      bookAdded: Book!
    }
  `
  
const resolvers = {
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      if (args.title.length < 3) {
        throw new UserInputError('book title is too short')
      }
      if (args.author.length < 5) {
        throw new UserInputError('author name is too short')
      }

      try {
        let author = await Author.findOne({
          name: args.author
        })
        if (!author) {
          const newAuthor = new Author({
            name: args.author
          })
          author = await newAuthor.save()
        }
        const book = new Book({
          ...args,
          author: author.id
        })
        const addedBook = await book.save().then(t => t.populate('author').execPopulate())
        author.books = author.books.concat(addedBook.id)
        author.save()
        pubsub.publish('BOOK_ADDED', {
          bookAdded: addedBook
        })
        return addedBook
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
  },
  Query: {
    allBooks: async (root, args) => {
      let returnBooks = await Book.find({}).populate('author')
      if (args.author) {
        returnBooks = returnBooks.filter((b) => b.author === args.author)
      }
      if (args.genre) {
        returnBooks = await Book.find({
          genres: {
            $in: args.genre
          }
        }).populate('author')
      }
      return returnBooks
    },
  },
}
module.exports = {
  typeDef,
  resolvers
}