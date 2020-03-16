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
  Form
} from 'antd'
import { useParams, useHistory, Link } from 'react-router-dom'
import moment from 'moment'

import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

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

  const [datastore, setDatastore] = React.useState(null)
  const [datastoreData, setDatastoreData] = React.useState([])
  const [filters, setFilters] = React.useState(null)
  const [showCreateDataRow, setShowCreateDataRow] = React.useState(false)
  const [createDataRowForm] = Form.useForm()

  const fetchDatastore = async (
    rowIndexSkip = 0,
    retrieveCount = 10,
    filters = null
  ) => {
    try {
      const datastore = await api.datastore.getUserDatastore(
        session.userId,
        datastoreId
      )
      setDatastore(datastore)

      const datastoreData = await api.datastore.getDatastoreData(
        datastoreId,
        rowIndexSkip,
        retrieveCount,
        filters
      )
      setDatastoreData(datastoreData)
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const parseDatastoreColumns = () => {
    const columns = Object.entries(datastore.columns).map(
      ([columnName, column]) => {
        return {
          title: columnName,
          dataIndex: columnName,
        }
      }
    )
    columns.unshift({

        title: 'RowIndex',
        dataIndex: 'rowIndex',
    })
    columns.push({
      title: 'Action',
      dataIndex: 'rowIndex',
      render: (text, row, index) => (
        <a
          onClick={() => {
            console.log(text)
          }}
        >
          Detial
        </a>
      )
    })
    console.log(columns)
    return columns
  }

  const parseDatastoreData = () => {
    const data = datastoreData.filter(row=>row.revoked!==true).map(row=>{
      const entry = {}
      entry.rowIndex = row.rowIndex
      entry.key = 'ds_row_' + row.rowIndex
      for(const [columnName, column] of Object.entries(row.columns)){
        entry[columnName] = 'N/A'
        if(column.history){
          const last = column.history.pop()
          if(last){
            entry[columnName] = last.t_bc ? last.value : last.value + ' [*]'
          }
        }
      }
      return entry
    })
    return data
  }

  const parseColumn = (columnName, dataValue) => {
    return { ...datastore.columns[columnName], dataValue }
  }
  const createDataRow = async values => {
    const datastoreId = datastore.datastoreId
    const contractId = datastore.contract
    const row = {}
    for (const [columnName, dataValue] of Object.entries(values)) {
      if(dataValue){
        row[columnName] = parseColumn(columnName, dataValue)
      }
    }
    const rowIndex = await api.datastore.writeDataStoreDataRow(
      datastoreId, contractId, row
    )
    setShowCreateDataRow(false)
    fetchDatastore()
    console.log(rowIndex)
  }

  React.useEffect(() => {
    fetchDatastore()
  }, [])

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
            <Button type="default">Refresh</Button>
            <span style={{ flexGrow: 1 }}></span>
            <Input.Search
              placeholder="input search text"
              style={{ width: 300 }}
              onSearch={value => console.log(value)}
              enterButton
            />
          </div>
          <Table
            dataSource={parseDatastoreData()}
            style={{ marginTop: 20 }}
            bordered={false}
            columns={parseDatastoreColumns()}
          />
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
        </React.Fragment>
      ) : null}
    </React.Fragment>
  )
}
