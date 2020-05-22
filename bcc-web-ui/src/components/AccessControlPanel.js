import React from 'react'

import { Tabs, Form, Input, Button, message, List, Divider } from 'antd'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

export default function AccessControlPanel(props) {
  const { parentType, parentId } = props
  const { session, setSession } = React.useContext(UserSessionContext)
  const { userId } = session
  const [actorForm] = Form.useForm()

  const [access, setAccess] = React.useState(null)

  const [activeTab, setActiveTab] = React.useState('readWhiteList')

  const fetchAccess = async () => {
    try {
      if (parentType && parentId) {
        const access = await api.access.getAccess(userId, parentType, parentId)
        setAccess(access)
      }
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  React.useEffect(() => {
    fetchAccess()
  }, [parentType, parentId])

  const appendActor = async values => {
    try {
      const { actor } = values
      await api.access.appendActorToList(
        userId,
        parentType,
        parentId,
        activeTab,
        actor.split(';')
      )
      await fetchAccess()
    } catch (error) {
      console.log(error)
      message.error('Append actor to list failed.')
    }
  }
  const removeActor = async (actor) => {
    try {
      await api.access.removeActorFromList(
        userId,
        parentType,
        parentId,
        activeTab,
        [actor]
      )
      await fetchAccess()
    } catch (error) {
      console.log(error)
      message.error('Remove actor to list failed.')
    }
  }

  const renderList = dataSource => {
    return (
      <List
        style={{ maxHeight: 300, overflowY: 'auto' }}
        dataSource={dataSource}
        renderItem={item => (
          <List.Item actions={[<a onClick={()=>{removeActor(item)}}>Remove</a>]}>
            <div>{item}</div>
          </List.Item>
        )}
      />
    )
  }

  if (access) {
    return (
      <div>
        {parentType === 'datastore' ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Read White List" key="readWhiteList">
            {renderList(access.readWhiteList)}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Write White List" key="writeWhiteList">
            {renderList(access.writeWhiteList)}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Black List" key="blackList">
            {renderList(access.blackList)}
          </Tabs.TabPane>
        </Tabs>
        ):(
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Call White List" key="readWhiteList">
            {renderList(access.readWhiteList)}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Call Black List" key="blackList">
            {renderList(access.blackList)}
          </Tabs.TabPane>
        </Tabs>
        )}
        
        <Divider />
        <Form layout="inline" form={actorForm} onFinish={appendActor}>
          <Form.Item
            label="Actor"
            name="actor"
            rules={[
              {
                required: true,
                message: 'Please give a actor.'
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginRight: 10 }}
            >
              Append To List
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  } else {
    return <div>No access rule found.</div>
  }
}
