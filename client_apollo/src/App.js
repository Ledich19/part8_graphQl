import React, {
  useState,
} from 'react'
import { gql, useApolloClient, useQuery } from '@apollo/client';
import Persons from './Components/Persons';
import PersonForm from './Components/PersonForm';
import {ALL_PERSONS} from './query'
import Notify from './Components/Notify';
import PhoneForm from './Components/PhoneForm';
import LoginForm from './Components/LoginForm ';


const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS, {
    pollInterval: 2000
  })
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (result.loading)  {
    return <div>loading...</div>
  }
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  if (!token) {
    return (
      <div>
        <button onClick={logout}>
        logout
      </button>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm
          setToken={setToken}
          setError={notify}
        />
      </div>
    )
  }

  return (
    <>
    <Notify errorMessage={errorMessage} />
      <Persons persons = {result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </>
  )
}

export default App