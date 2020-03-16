import React, { useContext, useState, useEffect } from 'react'
import { DeleteOutlined, EyeOutlined, SecurityScanOutlined } from '@ant-design/icons';
import {
  Button,
  Table,
  Modal,
  Card,
  Breadcrumb,
  message,
  Drawer,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Row,
  Col,
} from 'antd';
import { useHistory, useRouteMatch, Link } from 'react-router-dom'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import CallServiceForm from '../components/CallServiceForm'

export default function ServiceListView() {
  const { session } = useContext(UserSessionContext)
  const history = useHistory()
  const { url } = useRouteMatch()
  const [serviceList, setServiceList] = useState([])
  const [viewService, setViewService] = useState(null)

  const makeServiceCall = async values => {
    console.log(values)
    const { serviceId, callArgs, gas, gasPrice } = values
    try {
      const result = await api.service.callUserService(serviceId, {
        callArgs,
        gas,
        gasPrice
      })
      setViewService({ ...viewService, callResult: result })
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const fetchUserServiceList = async () => {
    try {
      const {userId} = session
      const serviceList = await api.service.getUserServiceList(userId)

      for (const service of serviceList) {
        const { chainId, contractId, functionName } = service.config
        service.key = service.serviceId
        service.functionName = functionName
        service.chain = await api.chain.getUserChain(userId, chainId)
        service.contract = await api.contract.getUserChainContract(
          userId,
          chainId,
          contractId
        )
      }
      setServiceList(serviceList)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const deleteService = async serviceId => {
    const { userId } = session
    try {
      await api.service.deleteUserService(userId, serviceId)
      message.success('Service deleted.')
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const renderViewService = service => {
    const abi = service.contract.abi.filter(
      a => a.name === service.functionName
    )[0]
    return (
      <React.Fragment>
        <Typography.Title level={4}>Service: {service.name}</Typography.Title>
        <Divider />

        <Row style={{ marginBottom: 10 }}>
          <Col span={3}>
            <Tag color="blue">RESTful API</Tag>
          </Col>
          <Col span={21}>
            <Tag color="orange">POST</Tag>
            <Tag>{`http://10.0.1.4/api/service/${service.serviceId}`}</Tag>
          </Col>
        </Row>
        {abi.inputs.length > 0 ? (
          <Row style={{ marginBottom: 10 }}>
            <Col span={3}></Col>
            <Col span={21}>
              <Tag color="orange">BODY</Tag>
              <Tag>
                {JSON.stringify({
                  option: {
                    callArgs: '[arrag of callArgs in order]',
                    gas: '[optional]',
                    gasPrice: '[optional]'
                  }
                })}
              </Tag>
            </Col>
          </Row>
        ) : null}

        <Divider />
        <CallServiceForm
          abi={abi}
          serviceId={service.serviceId}
          valueCallback={makeServiceCall}
        />
        {service.callResult ? (
          <React.Fragment>
            <Divider />
            <Row>
              <Col span={3}>
                <Tag color="blue">Result</Tag>
              </Col>
              <Col span={21}>
                {service.callResult.type === 'receipt' ? (
                  <span>
                    Receipt: {JSON.stringify(service.callResult.data)}
                  </span>
                ) : (
                  <span>
                    {typeof service.callResult.data === 'object'
                      ? JSON.stringify(service.callResult.data)
                      : service.callResult.data}
                  </span>
                )}
              </Col>
            </Row>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    )
  }

  useEffect(() => {
    fetchUserServiceList()
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
        <Breadcrumb.Item>My Service</Breadcrumb.Item>
      </Breadcrumb>

      <Card style={{ marginTop: 40 }}>
        <Card.Meta title="Service List" />
        <Table
          dataSource={serviceList}
          style={{ marginTop: 20 }}
          bordered={false}
          pagination={false}
        >
          <Table.Column title="Service Name" dataIndex="name" />
          <Table.Column title="Chain" dataIndex="chain.name" />
          <Table.Column title="Contract" dataIndex="contract.name" />
          <Table.Column
            title="At"
            dataIndex="contract.receipt.contractAddress"
          />
          <Table.Column title="Call" dataIndex="functionName" />
          <Table.Column
            title="Actions"
            key="action"
            render={(text, record) => (
              <React.Fragment>
                <EyeOutlined
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={() => {
                    setViewService(record)
                  }} />
                <SecurityScanOutlined style={{ fontSize: 20, marginRight: 10 }} onClick={() => {}} />
                <DeleteOutlined
                  style={{ fontSize: 20, marginRight: 10 }}
                  onClick={async () => {
                    await deleteService(record.serviceId)
                    await fetchUserServiceList()
                  }} />
              </React.Fragment>
            )}
          />
        </Table>
      </Card>

      <Modal
        visible={viewService !== null}
        width="60%"
        footer={null}
        onCancel={() => {
          setViewService(null)
        }}
      >
        {viewService ? renderViewService(viewService) : null}
      </Modal>
    </React.Fragment>
  );
}
