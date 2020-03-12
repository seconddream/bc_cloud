import React, { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { Layout, Divider, message } from 'antd'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import Logo from '../components/Logo'
import LoginForm from '../components/LoginForm'
import SignUpForm from '../components/SignUpForm'

const { Sider, Content } = Layout

export default function LoginView() {
  const { session, setSession } = useContext(UserSessionContext)

  const login = async values => {
    const { email, password, remember } = values
    try {
      const user = await api.user.login(email, password, remember)
      setSession(user)
    } catch (error) {
      message.error(error.message)
    }
  }

  const signUp = async values => {
    const { email, password } = values
    try {
      await api.user.signUp(email, password)
      message.success('Account created, please login now.')
    } catch (error) {
      message.error(error.message)
    }
  }

  if (session) {
    return <Redirect to="/home/dashboard" />
  } else {
    return (
      <Layout style={{ height: '100vh' }}>
        <Sider theme="light" collapsed={false} collapsible={false} width={400}>
          <Logo showTitle dark />
          <LoginForm valueCallback={login} />
          <Divider>Or</Divider>
          <SignUpForm valueCallback={signUp}  />
        </Sider>
        {/* content -------------------------------------------------- */}
        <Layout style={{ height: '100vh' }}>
          <Content style={{ padding: 16 }}></Content>
        </Layout>
      </Layout>
    )
  }
}
