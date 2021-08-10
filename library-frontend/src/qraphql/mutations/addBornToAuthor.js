import { gql  } from '@apollo/client'
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
export default EDIT_AUTHOR