import { gql  } from '@apollo/client'
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
export default ADD_BOOK