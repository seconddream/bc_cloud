import React from 'react'
import {
  Breadcrumb,
  Icon,
  Menu,
  Button,
  message,
  Tooltip,
  Row,
  Col,
  Card,
  Statistic,
  Skeleton,
  Alert,
  Table,
  Descriptions,
  Drawer,
  Divider,
  Modal,
  Form
} from 'antd'
import { useParams, useHistory, Link } from 'react-router-dom'
import moment from 'moment'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import ChainConfigurationForm from '../components/ChainConfigurationForm'
import TaskConsolePopUp from '../components/TaskConsolePopUp'
import CreateServiceForm from '../components/CreateServiceForm'
import CreateDatastoreForm from '../components/CreateDatastoreForm'
import DatastoreKeyForm from '../components/DatastoreKeyForm'

const dataType = {
  string: 0,
  int: 1,
  float: 2,
  boolean: 3
}

const dataTypeIndex = ['string', 'int', 'float', 'boolean']

export default function ChainView() {
  const { session } = React.useContext(UserSessionContext)
  const params = useParams()
  const history = useHistory()

  const [chain, setChain] = React.useState(null)
  const [showUpdateConfiguration, setShowUpdateConfiguration] = React.useState(
    false
  )
  const [monitorTask, setMonitorTask] = React.useState(null)
  const [viewContractId, setViewContractId] = React.useState(null)
  const [viewCreateService, setViewCreateService] = React.useState(null)
  const [showCreateDatastore, setShowCreateDatastore] = React.useState(false)
  const [viewDatastore, setViewDatastore] = React.useState(null)

  const fetchUserChain = async () => {
    try {
      const { userId } = session
      const { chainId } = params
      const chain = await api.chain.getUserChain(userId, chainId)
      const contracts = await api.contract.getUserChainContractList(userId, chainId)
      const datastores = await api.datastore.getUserChainDatastoreList(userId, chainId)
      setChain({...chain, contracts, datastores})
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const updateConfiguration = async config => {
    try {
      setShowUpdateConfiguration(false)
      await api.chain.updateUserChainConfig(
        session.userId,
        chain.chainId,
        config
      )
      await fetchUserChain()
      message.success('Chain configuration updated.')
    } catch (error) {
      setShowUpdateConfiguration(false)

      console.log(error)
      message.error(error.message)
    }
  }

  const createDeployment = async () => {
    try {
      const { taskId } = await api.chain.createUserChainDeployment(
        session.userId,
        chain.chainId
      )
      await fetchUserChain()
      setMonitorTask(taskId)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const deleteDeployment = async () => {
    try {
      const { taskId } = await api.chain.deleteUserChainDeployment(
        session.userId,
        chain.chainId
      )
      await fetchUserChain()
      setMonitorTask(taskId)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const createService = async values => {
    const {userId} = session
    try {
      const {
        contractId,
        serviceName,
        functionName,
      } = values
      await api.service.createUserService(userId, serviceName, {
        chainId: chain.chainId,
        contractId,
        functionName
      })
      message.success('Service created.')
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const createDatastore = async values => {
    try {
      let { name, type, schema } = values
      const { taskId } = await api.datastore.deployDatastoreToUserChain(
        session.userId,
        chain.chainId,
        name,
        type,
        schema
      )
      await setMonitorTask(taskId)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }


  React.useEffect(() => {
    fetchUserChain()
  }, [])

  if (!chain) return <Skeleton active />

  const allowDeploy =
    chain.chainConfiguration !== null && chain.deployment === null
  const allowUndeploy = chain.deployment !== null
  const allowConfigurationUpdate = chain.deployment === null

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
        <Breadcrumb.Item>
          <Link to="/home/chain">My Chain</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>{chain.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      {monitorTask ? (
        <TaskConsolePopUp
          taskId={monitorTask}
          onClose={async () => {
            setMonitorTask(null)
            await fetchUserChain()
          }}
        />
      ) : null}

      {/* chain statistics ------------------------------------------------- */}
      <Row gutter={20} style={{ marginTop: 40 }}>
        <Col span={6}>
          <Card>
            <Card.Meta title="Status" />
            <Statistic
              value={chain.status}
              valueStyle={{ color: '#3f8600' }}
              prefix={<Icon type="database" style={{ marginRight: 10 }} />}
              style={{ marginTop: 10 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Card.Meta title="Up Time" />
            <Statistic
              value={
                chain.deployment
                  ? chain.deployment.createdOn
                    ? moment()
                        .diff(moment(chain.deployment.createdOn), 'hours', true)
                        .toFixed(2) + ' Hours'
                    : '0 Hours'
                  : '0 Hours'
              }
              valueStyle={{ color: '#3f8600' }}
              prefix={<Icon type="clock-circle" style={{ marginRight: 10 }} />}
              style={{ marginTop: 10 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Card.Meta title="Contracts" />
            <Statistic
              value={chain.contracts.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<Icon type="audit" style={{ marginRight: 10 }} />}
              style={{ marginTop: 10 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Card.Meta title="Datastore" />
            <Statistic
              value={chain.datastores.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<Icon type="shop" style={{ marginRight: 10 }} />}
              style={{ marginTop: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* chain deployed datastore ------------------------------------- */}
      <Row gutter={20} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card>
            <Card.Meta title="Datastore on Chain" />
            <Table
              dataSource={chain.datastores.map(d => {
                d.key = d.datastoreId
                return d
              })}
              style={{ marginTop: 20 }}
              bordered={false}
              pagination={false}
            >
              <Table.Column title="Name" dataIndex="name" />
              <Table.Column title="Type" dataIndex="type" />
              <Table.Column title="Address" dataIndex="address" />
              <Table.Column
                title="Action"
                render={(text, record) => (
                  <React.Fragment>
                    <Tooltip title="View Datastore">
                      <Icon
                        type="eye"
                        style={{ fontSize: 20, marginRight: 10 }}
                        onClick={() => {
                          setViewDatastore(record)
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Delete Datastore">
                      <Icon
                        type="delete"
                        style={{ fontSize: 20, marginRight: 10 }}
                        onClick={async () => {
                          console.log(record)
                          await api.datastore.deleteUserChainDatastore(
                            session.userId,
                            chain.chainId,
                            record.datastoreId
                          )
                          await fetchUserChain()
                        }}
                      />
                    </Tooltip>
                  </React.Fragment>
                )}
              />
            </Table>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <Button
                type="primary"
                disabled={
                  !chain.deployment || chain.status !== 'Deployed'
                }
                onClick={() => {
                  setShowCreateDatastore(true)
                }}
              >
                Create
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* chain deployed contracts ------------------------------------- */}
      <Row gutter={20} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card>
            <Card.Meta title="Contracts on Chain" />
            <Table
              dataSource={chain.contracts.map((contract, index) => ({
                ...contract,
                key: 'contract_' + index
              }))}
              style={{ marginTop: 20 }}
              bordered={false}
              pagination={false}
            >
              <Table.Column title="Name" dataIndex="name" />
              <Table.Column
                title="Address"
                dataIndex="receipt.contractAddress"
              />
              <Table.Column
                title="Actions"
                render={(text, record) => (
                  <React.Fragment>
                    <Tooltip title="View Receipt">
                      <Icon
                        type="eye"
                        style={{ fontSize: 20, marginRight: 10 }}
                        onClick={() => {
                          setViewContractId(record.contractId)
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Delete Contract">
                      <Icon
                        type="delete"
                        style={{ fontSize: 20, marginRight: 10 }}
                        onClick={async () => {
                          try {
                            await api.contract.deleteUserChainContract(
                              session.userId,
                              params.chainId,
                              record.contractId
                            )
                            await fetchUserChain()
                          } catch (error) {
                            console.log(error)
                            message.error(error.message)
                          }
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Create Service">
                      <Icon
                        type="cloud-server"
                        style={{ fontSize: 20, marginRight: 10 }}
                        onClick={() => {
                          setViewCreateService(record)
                        }}
                      />
                    </Tooltip>
                  </React.Fragment>
                )}
              />
            </Table>
          </Card>
        </Col>
      </Row>

      {/* chain deployment details ------------------------------------- */}
      <Row gutter={20} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card>
            <Card.Meta title="Chain" />
            {!chain.config ? (
              <Alert
                style={{ marginTop: 20 }}
                type="info"
                showIcon
                message="Chain Not Configured"
                description="This chain hasn't been configured,
                    please set the configuration in Chain Configuration."
              />
            ) : null}

            {chain.config ? (
              <React.Fragment>
                <Descriptions column={3} size="small" style={{ marginTop: 20 }}>
                  <Descriptions.Item label="Type">
                    {chain.config.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sealer">
                    {chain.config.sealerNodeCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Non-sealer">
                    {chain.config.transactionNodeCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gas Price">
                    {chain.config.gasPrice}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gas Limit">
                    {chain.config.gasLimit}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gas Target">
                    {chain.config.gasTarget}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tx Pool Price Limit">
                    {chain.config.txpoolPriceLimit}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expose to Public">
                    {chain.config.expose ? 'Yes' : 'No'}
                  </Descriptions.Item>

                </Descriptions>
                <Descriptions column={3} size='small' style={{marginTop: 10}}>
                  <Descriptions.Item label="Cluster Namespace">
                    {chain.deployment ? chain.deployment.namespace : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Instance Deployed on">
                    {chain.deployment ? moment(chain.deployment.createdOn).format(
                      'DD-MM-YYYY hh:mm:ss'
                    ): 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </React.Fragment>
            ) : null}

            <div style={{ marginTop: 20, display: 'flex' }}>
              <Tooltip title="Deploy chain as configured">
                <Button
                  type="primary"
                  icon="database"
                  disabled={!allowDeploy}
                  style={{ marginRight: 10 }}
                  onClick={createDeployment}
                >
                  Deploy
                </Button>
              </Tooltip>
              <Tooltip title="Change chain configuration">
                <Button
                  type="primary"
                  icon="setting"
                  style={{ marginRight: 10 }}
                  disabled={!allowConfigurationUpdate}
                  onClick={() => {
                    setShowUpdateConfiguration(true)
                  }}
                >
                  Configuration
                </Button>
              </Tooltip>
              <Tooltip title="Delete current chain deployment">
                <Button
                  disabled={!allowUndeploy}
                  type="danger"
                  icon="delete"
                  style={{ marginRight: 10 }}
                  onClick={deleteDeployment}
                >
                  Undeploy
                </Button>
              </Tooltip>
            </div>

            <Divider />
            {/* pods ------------------------------------------------------- */}
            {chain.deployment && chain.deployment.status === 'Deployed' ? (
              <React.Fragment>
                <Card.Meta title="Pods" style={{ marginTop: 20 }} />
                <Table
                  dataSource={chain.deployment.pods.map((pod, index) => ({
                    ...pod,
                    key: 'pod_' + index
                  }))}
                  style={{ marginTop: 20 }}
                  bordered={false}
                  pagination={false}
                >
                  <Table.Column title="Name" dataIndex="metadata.name" />
                  <Table.Column title="Status" dataIndex="status.phase" />
                </Table>
              </React.Fragment>
            ) : null}
          </Card>
        </Col>
      </Row>

      {/* update chain drawer ---------------------------------------------- */}
      <Drawer
        title="Update Chain Configuration"
        width={500}
        visible={showUpdateConfiguration}
        onClose={() => {
          setShowUpdateConfiguration(false)
        }}
      >
        <ChainConfigurationForm
          chain={chain}
          valueCallback={updateConfiguration}
        />
      </Drawer>

      {/* create service drawer -------------------------------------------- */}
      <Drawer
        title="Create Service"
        width={500}
        visible={viewCreateService !== null}
        onClose={() => {
          setViewCreateService(null)
        }}
      >
        <CreateServiceForm
          contract={viewCreateService}
          valueCallback={createService}
        />
      </Drawer>

      {/* create datastore drawer ------------------------------------------ */}
      <Drawer
        title="Create Datastore"
        width={500}
        visible={showCreateDatastore}
        onClose={() => {
          setShowCreateDatastore(false)
        }}
      >
        <CreateDatastoreForm valueCallback={createDatastore} />
      </Drawer>

      {/* view contract modal ---------------------------------------------- */}
      <Modal
        title="Contract"
        visible={viewContractId !== null}
        onCancel={() => {
          setViewContractId(null)
        }}
        footer={null}
        width={800}
      >
        {viewContractId ? (
          <React.Fragment>
            {chain.contracts
              .filter(c => c.contractId === viewContractId)
              .map(contract => (
                <Descriptions
                  key={'desc_' + contract.contractId}
                  column={1}
                  size="middle"
                >
                  <Descriptions.Item label="Name">
                    {contract.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deployed On">
                    {moment(contract.deployedOn).format('DD-MM-YYYY hh:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Block Hash">
                    {contract.receipt.blockHash}
                  </Descriptions.Item>
                  <Descriptions.Item label="Block Number">
                    {contract.receipt.blockNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contract Address">
                    {contract.receipt.contractAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cumulative Gas Used">
                    {contract.receipt.cumulativeGasUsed}
                  </Descriptions.Item>
                  <Descriptions.Item label="From">
                    {contract.receipt.from}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction Index">
                    {contract.receipt.transactionIndex}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction Hash">
                    {contract.receipt.transactionHash}
                  </Descriptions.Item>
                </Descriptions>
              ))}
          </React.Fragment>
        ) : null}
      </Modal>

      {/* view datastore modal ---------------------------------------------- */}
      <Modal
        title="Datastore"
        visible={viewDatastore !== null}
        onCancel={() => {
          setViewDatastore(null)
        }}
        footer={null}
        width={800}
      >
        {viewDatastore ? (
          <React.Fragment>
            <Card.Meta title={viewDatastore.name} />
            <Table
              dataSource={viewDatastore.keys.map((v, i)=>{
                return {
                  key: `datastore_key_${i}`,
                  keyIndex: i,
                  keyName: v,
                  keyDataType: dataTypeIndex[viewDatastore.keyDataTypes[i]],
                }
              })}
              style={{ marginTop: 10 }}
              pagination={false}
              size="small"
            >
              <Table.Column title="Key Index" dataIndex="keyIndex" />
              <Table.Column title="Name" dataIndex="keyName" />
              <Table.Column title="Data Type" dataIndex="keyDataType" />
              {/* <Table.Column
                title="Action"
                render={(text, record, index) => {
                  // console.log(record)
                  return (
                    <Button
                      onClick={() => {
                        // setKeys(keys.filter((k, i) => i !== index))
                      }}
                      icon="delete"
                    ></Button>
                  )
                }}
              /> */}
            </Table>
            {/* <DatastoreKeyForm
              valueCallback={() => {}}
              refreshCallback={() => {}}
            /> */}
          </React.Fragment>
        ) : null}
      </Modal>
    </React.Fragment>
  )
}
