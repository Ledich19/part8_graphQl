import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import ALL_BOOKS from '../qraphql/quiries/allBooks'

const Books = (props) => {
const [filter, setFilter] = useState('all')

  const result = useQuery(ALL_BOOKS) 
  if (!props.show) {
    return null
  }
  if (result.loading)  {
    return <div>loading...</div>
  }
  const books = result.data.allBooks

 const arrGenres = books.map((b) => b.genres)
 const genres = [...new Set([].concat(...arrGenres))];

  let booksShow ;
  if (filter === 'all') {
    booksShow = books
  }else{
    booksShow = books.filter((b) => b.genres.includes(filter) )
  console.log(booksShow)
  }
  
  return (
    <div>
      <h2>books</h2>
      <table>
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
          {booksShow.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genres.map(g =>
            <button key={g} onClick={() => setFilter(g)} >{g}</button>
          )}
    </div>
  )
}

export default Books