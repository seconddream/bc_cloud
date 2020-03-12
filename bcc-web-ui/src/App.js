import React from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'

import { UserSessionContext } from './contexts/UserSessionContext'
import HomeView from './containers/HomeView'
import LoginView from './containers/LoginView'

export default function App() {
  const { session } = React.useContext(UserSessionContext)
  const location = useLocation()

  return (
    <Switch>
      <Route exact path="/">
        {session === null ? (
          <Redirect to="/login" />
        ) : (
          <Redirect
            to={location.pathname === '/' ? '/home' : location.pathname}
          />
        )}
      </Route>
      <Route path="/login" component={LoginView} />
      <Route path="/home" component={HomeView} />
    </Switch>
  )
}
