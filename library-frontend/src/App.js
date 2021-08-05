
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Notifikation from './components/Notifikation'
import Recommend from './components/Recommend'
import { ALL_AUTHORS, ME } from './queres'

const App = () => {
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const [getUser, resultUser] = useLazyQuery(ME) 

  useEffect(() => {
    if (token) {
      getUser()
    }
  },[token,getUser])

const result = useQuery(ALL_AUTHORS)

const handleSetError = (error) => {
  setErrorMessage(error)
  setTimeout(() => {
    setErrorMessage(null)
  }, 5000)
}

const client = useApolloClient()
const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
}

if (result.loading)  {
  return <div>loading...</div>
}

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token 
    ? <>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
        <button onClick={logout}>logout</button>
      </>
    : <button onClick={() => setPage('login')}>login</button>
    } 
        
      </div>
      <Notifikation message={errorMessage} />
      <Authors
        authors={result.data.allAuthors}
        token={token}
        show={page === 'authors'}
      />
      <Books
        show={page === 'books'}
      />
    
{ !token  
  ? <LoginForm show={page === 'login'} setPage={setPage} setToken={setToken} setError={setError}/>
  : <div>
    <NewBook setError={handleSetError} show={page === 'add'}/>
    <Recommend show={page === 'recommend' } user={resultUser.data}/></div>}
    </div>
  )
}

export default App