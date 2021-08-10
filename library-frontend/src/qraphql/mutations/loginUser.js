import { gql  } from '@apollo/client'
const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(username: $username, password: $password)  {
   value
  }
}
`
export default LOGIN