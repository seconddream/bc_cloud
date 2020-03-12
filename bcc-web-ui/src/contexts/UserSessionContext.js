import React from 'react'
import api from '../api/index'

export const UserSessionContext = React.createContext({
  session: null,
  setSession: ()=>{}
})


export const UserSessionContextProvider = (props)=>{

  const [state, setState] = React.useState({
    session: api.user.getLocalSession(),
    setSession: (session)=>{
      setState({...state, session})
    }
  })

  return (
    <UserSessionContext.Provider value={state}>
      {props.children}
    </UserSessionContext.Provider>
  )



}
