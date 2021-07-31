import React, {
  useState,
} from 'react'
import { gql, useQuery } from '@apollo/client';
import Persons from './Components/Persons';
import PersonForm from './Components/PersonForm';
import {ALL_PERSONS} from './query'
import Notify from './Components/Notify';
import PhoneForm from './Components/PhoneForm';


const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS, {
    pollInterval: 2000
  })

  if (result.loading)  {
    return <div>loading...</div>
  }
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
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