import React, { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import {
  Row,
  Col,
  Card,
  Typography,
  message,
  List,
  Tag,
  Descriptions,
  Statistic,
} from 'antd'
import {
  AuditOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  ShopOutlined,
  ForkOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

const { Text } = Typography

export default function DashboardView() {
  const { session } = React.useContext(UserSessionContext)
  const [user, setUser] = React.useState(null)

  const fetchUser = async () => {
    const user = await api.user.getUser(session.userId)
    const tasks = []
    for (const taskId of user.tasks) {
      const task = await api.task.getUserTask(session.userId, taskId)
      tasks.push(task)
    }
    user.tasks = tasks
    console.log(user)
    setUser(user)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  if (user) {
    return (
      <React.Fragment>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card bodyStyle={{ width: '100%', padding: 30 }}>
              <Card.Meta title="Profile" />
              <Descriptions column={1} style={{marginTop: 20}}>
                <Descriptions.Item label="Username">
                  {user.email}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  {user.userId}
                </Descriptions.Item>
                <Descriptions.Item label="Account Address">
                  {user.accountAddr}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card bodyStyle={{ width: '100%', padding: 30 }}>
              <Card.Meta title="User Chain" />
              <Statistic
                value={user.chains.length + ' chain(s)'}
                valueStyle={{ color: '#3f8600', fontSize: 30 }}
                prefix={
                  <ForkOutlined style={{ marginRight: 10, fontSize: 30 }} />
                }
                style={{ marginTop: 30 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ width: '100%', padding: 30 }}>
              <Card.Meta title="User Project" />
              <Statistic
                value={user.projects.length + ' projects(s)'}
                valueStyle={{ color: '#3f8600', fontSize: 30 }}
                prefix={
                  <PictureOutlined style={{ marginRight: 10, fontSize: 30 }} />
                }
                style={{ marginTop: 30 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ width: '100%', padding: 30 }}>
              <Card.Meta title="User Service" />
              <Statistic
                value={user.services.length + ' services(s)'}
                valueStyle={{ color: '#3f8600', fontSize: 30 }}
                prefix={
                  <CloudServerOutlined
                    style={{ marginRight: 10, fontSize: 30 }}
                  />
                }
                style={{ marginTop: 30 }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card bodyStyle={{ width: '100%', padding: 30, height: 200 }}
              
            >
              <Card.Meta title="Tasks" />
              <List
                size="small"
                split={false}
                style={{ marginTop: 10, height: 120, overflowY: 'scroll' }}
              >
                {user.tasks.map((task) => (
                  <List.Item
                    key={`dashboard_taskList_${task.taskId}`}
                    style={{ display: 'flex' }}
                  >
                    <Text>{task.name}</Text>
                    <Text style={{ flexGrow: 1 }}> </Text>
                    <Text type="secondary" style={{ marginRight: 10 }}>
                      {moment(
                        task.logs[task.logs.length - 1].timestamp
                      ).fromNow()}
                    </Text>
                    <Tag>{task.status}</Tag>
                  </List.Item>
                ))}
              </List>
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ width: '100%', padding: 30 }}>
              <Card.Meta title="User Datastore" />
              <Statistic
                value={user.datastores.length + ' datastore(s)'}
                valueStyle={{ color: '#3f8600', fontSize: 30 }}
                prefix={
                  <DatabaseOutlined style={{ marginRight: 10, fontSize: 30 }} />
                }
                style={{ marginTop: 30 }}
              />
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    )
  } else {
    return null
  }
}
