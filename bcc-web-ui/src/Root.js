import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { UserSessionContextProvider } from './contexts/UserSessionContext'
import App from './App'


export default function Root() {
  return (
    <UserSessionContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserSessionContextProvider>
  )
}
