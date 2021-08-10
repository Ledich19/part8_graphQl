
import { useApolloClient, useLazyQuery, useQuery, useSubscription } from '@apollo/client'
import React, { useEffect, useState } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import Notifikation from './components/Notifikation'
import Recommend from './components/Recommend'

import ALL_BOOKS from './qraphql/quiries/allBooks'
import ME from './qraphql/quiries/me'
import BOOK_ADDED from './qraphql/mutations/createBook'

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [getUser, resultUser] = useLazyQuery(ME) 
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (token) {
      getUser()
    }
  },[token,getUser])
  useEffect(() => {
    if (resultUser.data) {
      setUser(resultUser.data.me)
    }
  },[resultUser])
  const logout = () => {
      setToken(null)
      setUser(null)
      localStorage.clear()
      client.resetStore()
  }
  const handleSetError = (error) => {
    setErrorMessage(error)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }



  const client = useApolloClient()
  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
    set.map(p => p.id).includes(object.id)  
    
    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }   
  }
  
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      alert(`${subscriptionData.data.bookAdded.title} was added`)
      updateCacheWith(subscriptionData.data.bookAdded)
    }
  })
  

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
      
        token={token}
        show={page === 'authors'}
      />
      <Books
        show={page === 'books'}
      />
    
{ !token  
  ? <LoginForm show={page === 'login'} setPage={setPage} setToken={setToken} setError={handleSetError}/>
  : <div>
    <NewBook updateCacheWith={updateCacheWith} setError={handleSetError} show={page === 'add'}/>
    <Recommend show={page === 'recommend' } user={user}/></div>}
    </div>
  )
}

export default App