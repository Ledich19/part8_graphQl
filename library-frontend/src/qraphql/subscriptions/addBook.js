import { gql  } from '@apollo/client'

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
export default BOOK_ADDED
  



