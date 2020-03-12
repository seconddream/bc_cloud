import React from 'react'
import {
  Descriptions,
  Row,
  Col,
  Icon,
  Statistic,
  Typography,
  Button,
  Divider
} from 'antd'
import moment from 'moment'

export default function ChainOverViewPanel(props) {
  const { chain, fetchUserChain } = props

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button onClick={fetchUserChain}>
          Refresh
        </Button>
        <div style={{flex: 1}}></div>
        <Button type='danger' style={{ marginLeft: 10 }} onClick={fetchUserChain}>
          Delete This Chain
        </Button>
      </div>
      <Divider />
      <Typography.Title level={4}>Chain Statistic</Typography.Title>
      <Row gutter={16} style={{ marginTop: 10 }}>
        <Col span={4}>
          <Statistic
            title="Deployment"
            value={chain.deployment ? 1 : 0}
            prefix={<Icon type="cloud-server" />}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Service"
            value={chain.services.length}
            prefix={<Icon type="cloud-server" />}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="DataStore"
            value={chain.dataStores.length}
            prefix={<Icon type="database" />}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="Contract"
            value={chain.contracts.length}
            prefix={<Icon type="file-text" />}
          />
        </Col>
      </Row>
      <Typography.Title level={4} style={{ marginTop: 30 }}>
        Chain Information
      </Typography.Title>
      <Descriptions bordered style={{ marginTop: 10 }}>
        <Descriptions.Item label="Chain Name">{chain.name}</Descriptions.Item>
        <Descriptions.Item label="Chain Type">
          {chain.chainConfiguration
            ? chain.chainConfiguration.type
            : 'Not Configured'}
        </Descriptions.Item>
        <Descriptions.Item label="Created On">
          {moment(chain.createdOn).format()}
        </Descriptions.Item>
        <Descriptions.Item label="Chain Id">{chain.chainId}</Descriptions.Item>
        <Descriptions.Item label="User Id">
          {chain.userId}
        </Descriptions.Item>
      </Descriptions>
    </React.Fragment>
  )
}
