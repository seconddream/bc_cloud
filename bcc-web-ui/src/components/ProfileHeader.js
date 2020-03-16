import React from 'react'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Button, message ,} from 'antd'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

const { Header } = Layout
export default function ProfileHeader() {
  const { session, setSession } = React.useContext(UserSessionContext)
  const [email, setEmail] = React.useState('')

  const fetchUser = async () => {
    try {
      const user = await api.user.getUser(session.userId)
      setEmail(user.email)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const logout = () => {
    setSession(null)
    api.user.removeLocalSession()
  }

  React.useEffect(() => {
    fetchUser()
  }, [])

  return (
    <Header
      style={{
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}
    >
      {email}
      <Button
        style={{ marginLeft: 10 }}
        type="primary"
        shape="circle"
        icon={<UserOutlined />}
      />
      <Button
        style={{ marginLeft: 10 }}
        type="primary"
        shape="circle"
        icon={<LogoutOutlined />}
        onClick={logout}
      />
    </Header>
  );
}
