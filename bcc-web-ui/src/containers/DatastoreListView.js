import React, { useContext, useState, useEffect } from 'react'
import {
  Button,
  Table,
  Modal,
  Card,
  Icon,
  Breadcrumb,
  message,
  Drawer,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Row,
  Col
} from 'antd'
import { useHistory, useRouteMatch, Link } from 'react-router-dom'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

export default function DatastoreListView() {
  const { session } = useContext(UserSessionContext)
  const history = useHistory()
  const { url } = useRouteMatch()
  const [datastoreList, setDatastoreList] = useState([])


  const fetchUserDatastoreList = async () => {
    try {
      const datastoreList = await api.datastore.getUserDatastoreList(session.userId)
      setDatastoreList(datastoreList.map(d=>{return {...d, key: d.datastoreId}}))
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  useEffect(() => {
    fetchUserDatastoreList()
  }, [])

  return (
    <React.Fragment>
      <Breadcrumb>
        <Breadcrumb.Item
          onClick={() => {
            history.push('/home')
          }}
        >
          <Link to="/home">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>My Datastores</Breadcrumb.Item>
      </Breadcrumb>

      <Card style={{ marginTop: 40 }}>
        <Card.Meta title="Datastore List" />
        <Table
          dataSource={datastoreList}
          style={{ marginTop: 20 }}
          bordered={false}
          pagination={false}
        >
          <Table.Column title="Datastore Name" dataIndex="name" />
          <Table.Column
            title="Actions"
            key="action"
            render={(text, record) => (
              <React.Fragment>
                <Icon
                  type="eye"
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={() => {
                    history.push(`${url}/${record.datastoreId}`)
                  }}
                />
                <Icon
                  type="security-scan"
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={() => {}}
                />
              </React.Fragment>
            )}
          />
        </Table>
      </Card>
    </React.Fragment>
  )
}
