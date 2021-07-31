
import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notifikation from './components/Notifikation'
import { ALL_AUTHORS } from './queres'

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)

const result = useQuery(ALL_AUTHORS)

const handleSetError = (error) => {
  setErrorMessage(error)
  setTimeout(() => {
    setErrorMessage(null)
  }, 5000)
}

if (result.loading)  {
  return <div>loading...</div>
}

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
      <Notifikation message={errorMessage} />
      <Authors
        authors={result.data.allAuthors}
        show={page === 'authors'}
      />
      <Books
        show={page === 'books'}
      />
      <NewBook
        setError={handleSetError}
        show={page === 'add'}
      />
    </div>
  )
}

export default App