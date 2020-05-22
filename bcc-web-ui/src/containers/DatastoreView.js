import React from 'react'
import {
  Breadcrumb,
  Button,
  message,
  Skeleton,
  Table,
  Drawer,
  Divider,
  Input,
  Select,
  Form,
  Modal,
  Tabs,
  Tag,
  Descriptions,
  Pagination
} from 'antd'
import { useParams, useHistory, Link } from 'react-router-dom'
import moment from 'moment'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

import DataValueUpdateForm from '../components/DataValueUpdateForm'
import AccessControlPanel from '../components/AccessControlPanel'

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const tailLayout = {
  wrapperCol: { offset: 6, span: 18 }
}

export default function DatastoreView() {
  const { session } = React.useContext(UserSessionContext)
  const params = useParams()
  const { datastoreId } = params
  const history = useHistory()
  const [createDataRowForm] = Form.useForm()

  const [rowIndexSkip, setRowIndexSkip] = React.useState(0)
  const [retrieveCount, setRetrieveCount] = React.useState(10)
  const [filters, setFilters] = React.useState('')
  const [datastore, setDatastore] = React.useState(null)
  const [datastoreData, setDatastoreData] = React.useState([])
  const [datastoreDisplayColumns, setDatastoreDisplayColumns] = React.useState(
    []
  )
  const [datastoreDisplayData, setDatastoreDisplayData] = React.useState([])
  const [detailRowIndex, setDetailRowIndex] = React.useState(null)
  const [showCreateDataRow, setShowCreateDataRow] = React.useState(false)
  const [showModifySecurity, setShowModifySecurity] = React.useState(false)
  const [showDatastoreCallAPI, setShowDatastoreCallAPI] = React.useState(false)

  // prepare table structure
  const parseDatastoreDisplayColumns = datastore => {
    const columns = Object.entries(datastore.columns).map(
      ([columnName, column]) => {
        return {
          title: columnName,
          dataIndex: columnName
        }
      }
    )
    columns.unshift({
      title: 'RowIndex',
      dataIndex: 'rowIndex'
    })
    columns.push({
      title: 'Revoked',
      dataIndex: 'revoked'
    })
    columns.push({
      title: 'Action',
      dataIndex: 'rowIndex',
      render: (text, row, index) => (
        <React.Fragment>
          <a
            onClick={() => {
              setDetailRowIndex(parseInt(text))
            }}
          >
            View
          </a>
        </React.Fragment>
      )
    })
    return columns
  }

  // prepare display data for datastore data
  const parseDatastoreDisplayData = dataSource => {
    const displayData = dataSource.map(row => {
      const entry = {}
      entry.rowIndex = row.rowIndex
      entry.key = 'ds_row_' + row.rowIndex
      entry.revoked =
        row.revoke !== null ? (row.revoke.t_bc ? 'Revoked' : 'Revoked *') : ''
      for (const [columnName, column] of Object.entries(row.columns)) {
        entry[columnName] = 'N/A'
        if (column.history && column.history.length > 0) {
          const last = column.history[column.history.length - 1]
          const displayValue =
            typeof last.value === 'boolean'
              ? JSON.stringify(last.value)
              : last.value
          if (last) {
            entry[columnName] = last.t_bc ? displayValue : displayValue + ' *'
          }
        }
      }
      return entry
    })
    return displayData
  }

  const fetchDatastore = async () => {
    try {
      let filtersObj = null

      if (filters !== '') {
        try {
          filtersObj = JSON.parse(filters)
        } catch (error) {
          console.log(error)
          message.error('Filter format wrong!')
          return
        }
      }

      // load datastore
      const datastore = await api.datastore.getUserDatastore(
        session.userId,
        datastoreId
      )
      setDatastore(datastore)

      // parse columns
      const datastoreDisplayColumns = parseDatastoreDisplayColumns(datastore)
      setDatastoreDisplayColumns(datastoreDisplayColumns)

      // load data
      const datastoreData = await api.datastore.getDatastoreData(
        datastoreId,
        rowIndexSkip,
        retrieveCount,
        filtersObj
      )
      console.log(datastoreData)
      setDatastoreData(datastoreData)

      // parse display data
      const datastoreDisplayData = parseDatastoreDisplayData(datastoreData)
      setDatastoreDisplayData(datastoreDisplayData)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  // prepare column for create data row
  const parseColumn = (columnName, dataValue) => {
    return { ...datastore.columns[columnName], dataValue }
  }

  const createDataRow = async values => {
    try {
      const datastoreId = datastore.datastoreId
      const contractId = datastore.contract
      const row = {}
      for (const [columnName, dataValue] of Object.entries(values)) {
        if (dataValue) {
          row[columnName] = parseColumn(columnName, dataValue)
        }
      }
      const rowIndex = await api.datastore.writeDataStoreDataRow(
        datastoreId,
        contractId,
        row
      )
      setShowCreateDataRow(false)
      fetchDatastore()
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const revokeRow = async rowIndex => {
    try {
      await api.datastore.revokeDatastoreDataRow(
        datastore.datastoreId,
        datastore.contract,
        rowIndex
      )
      fetchDatastore()
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const renderRowDetail = rowIndex => {
    const row = datastoreData.filter(r => r.rowIndex === rowIndex)[0]
    return (
      <React.Fragment>
        <div style={{ padding: 20 }}>
          {row.revoke === null ? (
            <div style={{ display: 'flex' }}>
              <Descriptions column={5} size="small">
                <Descriptions.Item label="Revoked">No</Descriptions.Item>
              </Descriptions>
              <Button
                type="danger"
                onClick={() => {
                  revokeRow(rowIndex)
                }}
              >
                Revoke This Row
              </Button>
            </div>
          ) : (
            <Descriptions column={5} size="small">
              <Descriptions.Item label="Revoked">Yes</Descriptions.Item>
              <Descriptions.Item label="Cached">
                {moment
                  .unix(parseInt(row.revoke.t_cached))
                  .format('MMM DD YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Mined">
                {row.revoke.t_bc
                  ? moment
                      .unix(parseInt(row.revoke.t_bc))
                      .format('MMM DD YYYY HH:mm:ss')
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="From">
                {row.revoke.actor ? row.revoke.actor : 'Unknown'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
        <Divider style={{ margin: 0 }} />
        <div style={{ padding: 40, paddingTop: 10 }}>
          <Tabs hideAdd>
            {Object.entries(row.columns).map(([columnName, column]) => (
              <Tabs.TabPane
                tab={columnName}
                key={`row_detial_${column.columnIndex}`}
              >
                {row.revoke === null ? (
                  <div style={{ marginBottom: 10 }}>
                    <DataValueUpdateForm
                      datastoreId={datastore.datastoreId}
                      contractId={datastore.contract}
                      rowIndex={detailRowIndex}
                      column={column}
                      refresh={fetchDatastore}
                      onRevoke={closeDetail}
                    />
                    <Divider />
                  </div>
                ) : null}
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  <Table
                    pagination={false}
                    dataSource={column.history
                      .map((h, i) => ({ ...h, key: `v_history_${i}` }))
                      .reverse()}
                    columns={[
                      {
                        title: 'Value',
                        dataIndex: 'value',
                        render: (text, history, index) => {
                          return typeof history.value === 'boolean'
                            ? JSON.stringify(history.value)
                            : history.value
                        }
                      },
                      {
                        title: 'Cached',
                        dataIndex: 't_cached',
                        render: (text, history, index) => {
                          return history.t_cached
                            ? moment
                                .unix(parseInt(history.t_cached))
                                .format('MMM DD YYYY HH:mm:ss')
                            : 'N/A'
                        }
                      },
                      {
                        title: 'Mined',
                        dataIndex: 't_bc',
                        render: (text, history, index) => {
                          return history.t_bc
                            ? moment
                                .unix(parseInt(history.t_bc))
                                .format('MMM DD YYYY HH:mm:ss')
                            : 'N/A'
                        }
                      },
                      {
                        title: 'By',
                        dataIndex: 'actor',
                        render: (text, history, index) => {
                          return history.actor ? history.actor : 'Unknown'
                        }
                      }
                    ]}
                  ></Table>
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </React.Fragment>
    )
  }

  const closeDetail = () => {
    setDetailRowIndex(null)
  }

  React.useEffect(() => {
    fetchDatastore(rowIndexSkip, retrieveCount, filters)
  }, [rowIndexSkip, retrieveCount])

  if (!datastore) return <Skeleton active />

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
          <Link to="/home/datastore">My Datastore</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span>{datastore.name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>
      {datastore ? (
        <React.Fragment>
          <div style={{ marginTop: 20, display: 'flex' }}>
            <Button
              type="primary"
              style={{ marginRight: 10 }}
              onClick={() => {
                setShowCreateDataRow(true)
              }}
            >
              New Data Row
            </Button>
            <Button
              type="default"
              onClick={fetchDatastore}
              style={{ marginRight: 10 }}
            >
              Refresh
            </Button>
            <Button
              type="default"
              style={{ marginRight: 10 }}
              onClick={() => {
                setShowModifySecurity(true)
              }}
            >
              Security
            </Button>
            <Button
              type="default"
              onClick={() => {
                setShowDatastoreCallAPI(true)
              }}
            >
              API Endpoint
            </Button>
            <span style={{ flexGrow: 1 }}></span>
            <Input.Search
              placeholder="input search text"
              style={{ width: 300 }}
              onChange={e => {
                setFilters(e.target.value)
              }}
              onSearch={fetchDatastore}
              enterButton
            />
          </div>
          <Table
            dataSource={datastoreDisplayData}
            style={{ marginTop: 20 }}
            bordered={false}
            columns={datastoreDisplayColumns}
            pagination={false}
          />
          {filters ? null : (
            <Pagination
              style={{ marginTop: 20 }}
              current={rowIndexSkip / retrieveCount + 1}
              defaultPageSize={retrieveCount}
              total={datastore.currentRowIndex}
              onChange={(page, pageSize) => {
                setRowIndexSkip((page - 1) * retrieveCount)
              }}
            />
          )}
          <Drawer
            title="Create Data Row"
            width={500}
            visible={showCreateDataRow}
            onClose={() => {
              setShowCreateDataRow(false)
            }}
          >
            <Form form={createDataRowForm} {...layout} onFinish={createDataRow}>
              {Object.entries(datastore.columns).map(([columnName, column]) => {
                if (column.columnDataType !== 'boolean') {
                  return (
                    <Form.Item
                      label={columnName}
                      name={columnName}
                      key={`form_${columnName}`}
                    >
                      <Input />
                    </Form.Item>
                  )
                } else {
                  return (
                    <Form.Item
                      label={columnName}
                      name={columnName}
                      key={`form_${columnName}`}
                    >
                      <Select>
                        <Select.Option value="true">true</Select.Option>
                        <Select.Option value="false">false</Select.Option>
                      </Select>
                    </Form.Item>
                  )
                }
              })}
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Drawer>
          <Drawer
            title="Modify Security Rules"
            width={500}
            visible={showModifySecurity}
            onClose={() => {
              setShowModifySecurity(false)
            }}
          >
            <AccessControlPanel
              parentType="datastore"
              parentId={datastore.datastoreId}
            />
          </Drawer>
          <Modal
            title={`Data Row ${detailRowIndex}`}
            visible={detailRowIndex !== null}
            width="80%"
            bodyStyle={{ padding: 0 }}
            onCancel={closeDetail}
            footer={null}
          >
            {detailRowIndex !== null ? renderRowDetail(detailRowIndex) : null}
          </Modal>
          <Modal
            title={`API Endpoint`}
            visible={showDatastoreCallAPI}
            width="80%"
            onCancel={()=>{setShowDatastoreCallAPI(false)}}
            footer={null}
          >
            <Descriptions title='Read Data' column={1}>
              <Descriptions.Item label='Method'>POST</Descriptions.Item>
              <Descriptions.Item label='URL'>{`http://10.0.1.4/api/datastore/${datastoreId}/read`}</Descriptions.Item>
              <Descriptions.Item label='Arguments'>rowIndexSkip, retrieveCount, filters</Descriptions.Item>
            </Descriptions>
            <Descriptions title='Write Data Row' column={1}>
              <Descriptions.Item label='Method'>POST</Descriptions.Item>
              <Descriptions.Item label='URL'>{`http://10.0.1.4/api/datastore/${datastoreId}/${datastore.contract}/row`}</Descriptions.Item>
          <Descriptions.Item label='Arguments'>{'row: { [columnName]: {columnName, columnDataType, dataValue} }'}</Descriptions.Item>
            </Descriptions>
            <Descriptions title='Revoke Data Row' column={1}>
              <Descriptions.Item label='Method'>POST</Descriptions.Item>
              <Descriptions.Item label='URL'>{`http://10.0.1.4/api/datastore/${datastoreId}/${datastore.contract}/data/:rowIndex`}</Descriptions.Item>
              <Descriptions.Item label='Arguments'>None</Descriptions.Item>
            </Descriptions>
            <Descriptions title='Update Data Field' column={1}>
              <Descriptions.Item label='Method'>PUT</Descriptions.Item>
              <Descriptions.Item label='URL'>{`http://10.0.1.4/api/datastore/${datastoreId}/${datastore.contract}/data/:rowIndex/:columnIndex/dataValue`}</Descriptions.Item>
              <Descriptions.Item label='Arguments'>columnName, columnDataType, dataValue</Descriptions.Item>
            </Descriptions>
          </Modal>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  )
}
