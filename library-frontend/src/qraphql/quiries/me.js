import { gql  } from '@apollo/client'


export const ME = gql`
query{
  me {
    favoriteGenre
    username
    id
  }
}
`

export default ME