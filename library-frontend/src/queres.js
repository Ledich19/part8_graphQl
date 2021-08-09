import { gql  } from '@apollo/client'

export const ALL_AUTHORS = gql`
query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
  `
  export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
        title
        published
        author{
          name
          born
        }
    }
  }

`

export const ME = gql`
query{
  me {
    favoriteGenre
    username
    id
  }
}
`

  export const ALL_BOOKS = gql`
query findBooks ($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      title
      published
      author{
        name
        born
      }
      genres
      id
    }
  }
  `
export const ADD_BOOK = gql`
mutation createBook($title: String!, $author: String!, $publishedInt: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $publishedInt,
    genres: $genres
  ) {
    title
    published
    author {
      name
      born
    }
    genres
    id
  }
}
`
export const EDIT_AUTHOR = gql`
mutation editBorn($name: String!, $born: Int!) {
  editAuthor(name: $name, setBornTo: $born)  {
    name
    born
    id
    bookCount
  }
}
  `

export const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(username: $username, password: $password)  {
   value
  }
}
`