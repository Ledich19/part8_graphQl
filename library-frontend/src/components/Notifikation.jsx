import React from 'react'

const Notifikation = ({ message }) => {
if (!message) {
  return null
}

  return (
    <div style={{ color: 'red' }}>
      {message}
    </div>
  )
}

export default Notifikation