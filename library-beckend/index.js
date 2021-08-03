const { ApolloServer, gql, UserInputError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/Author')
const User = require('./models/user')
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'
const MONGODB_URI = 'mongodb+srv://follstack:this_is_password@cluster0.9g99w.mongodb.net/Library?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

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

const typeDefs = gql`
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}
type Token {
  value: String!
}
  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String]!
  }
  type Query {
    bookCount: Int
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  type Mutation {
    addBook(
      title: String!,
      published: Int!,
      author: String!,
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
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
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let returnBooks = await Book.find({}).populate('author')
      if (args.author) {
        returnBooks = returnBooks.filter((b) => b.author === args.author)
      }
      if (args.genre) {
        returnBooks = await Book.find({genres: {$in:  args.genre }})
        //returnBooks = returnBooks.filter((b) => b.genres.includes(args.genre))
      }
      return returnBooks
    },
    allAuthors: () => Author.find({}),
    me: () => (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const authorBooks = await Book.find({author: root.id})
      return authorBooks.length
    }
  },
  Mutation: {
    addBook: async (root, args,context) => {
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
        let author = await Author.findOne({name: args.author})
        if (!author) {
          const newAuthor = new Author({name: args.author})
          author = await newAuthor.save()
        }
        const book = new Book({...args, author: author.id})
		const bookSave = book.save()
        return bookSave
    } catch(error) {
      throw new UserInputError(error.message, {
        invalidArgs: args,
      })
    }

    },
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
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id).populate('friends')
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})