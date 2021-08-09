import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { ALL_BOOKS} from '../queres'

const Recommend = ({ show , user}) => {
  
  const [getBooks, result] = useLazyQuery(ALL_BOOKS) 
  const [books, setBooks] = useState([])

  useEffect(() =>{
    if (user) {
      getBooks({variables: {genre: user.me.favoriteGenre}})
    }
  },[user,getBooks])
  useEffect(() =>{
    if (result.data) {
      setBooks(result.data.allBooks)
    }
  },[result.data])

  if (result.loading) {
    return <div>loading...</div>
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      <table>
        <caption>books in your favorite genre patterns</caption>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend