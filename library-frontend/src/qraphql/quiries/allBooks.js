import { gql  } from '@apollo/client'


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

export default ALL_BOOKS