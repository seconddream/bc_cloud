import React, { useContext, useState, useEffect } from 'react'
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Card, Breadcrumb, message, Drawer } from 'antd';
import { useHistory, useRouteMatch, Link } from 'react-router-dom'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import CreateChainForm from '../components/CreateChainForm'

export default function ChainListView() {

  const { session } = useContext(UserSessionContext)
  const history = useHistory()
  const { url } = useRouteMatch()
  const [showCreateChain, setShowCreateChain] = useState(false)
  const [chainList, setChainList] = useState([])

  const fetchUserChainList = async () => {
    try {
      const chainList = await api.chain.getUserChainList(session.userId)
      setChainList(
        chainList.map((chain, index) => {
          return {
            key: chain.chainId,
            name: chain.name,
            chainId: chain.chainId,
            type: chain.config
              ? chain.config.type
              : 'Not configured',
            status: chain.status,
          }
        })
      )
    } catch (error) {
      console.log(error)
      message.error(error)
    }
  }

  const createChain = async ({ name }) => {
    try {
      await api.chain.createUserChain(session.userId, name)
      setShowCreateChain(false)
      await fetchUserChainList()
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  useEffect(() => {
    fetchUserChainList()
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
        <Breadcrumb.Item>My Chain</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginTop: 40 }}>
        <Button
          key="create_chain"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowCreateChain(true)
          }}
        >
          Create Chain
        </Button>
      </div>

      <Card style={{ marginTop: 20 }}>
        <Card.Meta title='Chain List' />
        <Table
          dataSource={chainList}
          style={{ marginTop: 20 }}
          bordered={false}
          pagination={false}
        >
          <Table.Column title="Chain Name" dataIndex="name" />
          <Table.Column title="ChainID" dataIndex="chainId" />
          <Table.Column title="Chain Type" dataIndex="type" />
          <Table.Column title="Deployment Status" dataIndex="status" />
          <Table.Column
            title="Actions"
            key="action"
            render={(text, record) => (
              <React.Fragment>
                <EyeOutlined
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={() => {
                    history.push(`${url}/${record.chainId}`)
                  }} />
              </React.Fragment>
            )}
          />
        </Table>
      </Card>

      <Drawer
        title="Create New Chain"
        visible={showCreateChain}
        width={300}
        onClose={() => {
          setShowCreateChain(false)
        }}
      >
        <CreateChainForm valueCallback={createChain} />
      </Drawer>
    </React.Fragment>
  );
}
