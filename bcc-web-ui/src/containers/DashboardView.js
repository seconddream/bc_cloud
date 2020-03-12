import React, { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { Row, Col, Card, Typography, message, List, Tag } from 'antd'
import { UserContext } from '../contexts/UserContext'
import { getUserTaskList, getUserTask } from '../api'

const { Text } = Typography

export default function DashboardView() {

  const { user } = useContext(UserContext)
  const [taskList, setTaskList] = useState([])

  const fetchTaskList = async ()=>{
    let userTaskList = []
    const taskList = []
    try {
      userTaskList = await getUserTaskList(user.userId)
    } catch (error) {
      message.error(error.message)
    }
    for(const taskId of userTaskList){
      try {
        const task = await getUserTask(taskId)
        taskList.push(task)
      } catch (error) {
        message.error(error.message)
      }
    }
    setTaskList(taskList.reverse())
  }

  useEffect(()=>{
    fetchTaskList()
  }, [])

  return (
    <React.Fragment>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            hoverable
            bodyStyle={{ width: '100%', padding: 30, height: 300 }}
          >
            <Text type="secondary" strong>
              Recent Task
            </Text>
            <List
              size="small"
              split={false}
              style={{ marginTop: 10, height: 200, overflowY: 'auto' }}
            >
              {taskList.map(task => (
                <List.Item
                  key={`dashboard_taskList_${task.taskId}`}
                  style={{ display: 'flex' }}
                >
                  <Tag>{task.taskType}</Tag>
                  <Text style={{ flexGrow: 1 }}> </Text>
                  <Tag>{task.taskStatus}</Tag>
                  <Text type="secondary" style={{ marginRight: 10 }}>
                    {moment(
                      task.taskLog[task.taskLog.length - 1].timestamp
                    ).fromNow()}
                  </Text>
                </List.Item>
              ))}
            </List>
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ width: '100%', height: 300 }}></Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}
