import React from 'react'
import { Spinner } from 'react-bootstrap'

function Loader() {
  return (
    <div style={{ display: 'flex',
     justifyContent: 'center',
      alignItems: 'center',
       height: '100vh' }}>
        <h1>Loading...</h1>
         <Spinner animation="border" variant="primary" />

    </div>
  )
}

export default Loader