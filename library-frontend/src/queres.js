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
  export const ALL_BOOKS = gql`
query {
    allBooks {
      title
      published
      author
      id
    }
  }
  `
export const ADD_BOOK = gql`
mutation createBook($title: String!, $author: String!, $publishedInt: Int!, $genres: [String]!) {
  addBook(
    title: $title,
    author: $author,
    published: $publishedInt,
    genres: $genres
  ) {
    title
    author
    published
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