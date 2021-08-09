  
import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queres'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [bornTo, setBornTo] = useState('')
  const [chengeBorn] = useMutation(EDIT_AUTHOR, {refetchQueries: [{ query: ALL_AUTHORS }]})

  const updateAuthor = (event) => {
    event.preventDefault()
    const born = parseInt(bornTo)
    chengeBorn({ variables: { name, born}})
    setBornTo('')
  }
  if (!props.show) {
    return null
  }
  const authors = props.authors

  const handleChange = (event) => {
    setName(event.target.value)
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

    { props.token
    ? <form onSubmit={updateAuthor}>
    <div>
    <div>
    <select  onChange={handleChange}>
      {authors.map((a) => <option key={a.id} value={a.name} >{a.name}</option>)}
      </select>
    </div>

      <div>born:
      <input
        type='number'
        value={bornTo}
        onChange={({ target }) => setBornTo(target.value)}
      />
      </div>
    </div>
    <button type='submit'>update author</button>
  </form>
    : null}

    </div>
  )
}

export default Authors
