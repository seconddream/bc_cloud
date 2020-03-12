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
import CreateDataEntryForm from '../components/CreateDataEntryForm'

const dataType = {
  string: 0,
  int: 1,
  float: 2,
  boolean: 3
}

const dataTypeIndex = ['string', 'int', 'float', 'boolean']

export default function DatastoreView() {
  const { session } = React.useContext(UserSessionContext)
  const params = useParams()
  const { datastoreId } = params
  const history = useHistory()

  const [datastore, setDatastore] = React.useState(null)
  const [dataColum, setDataColum] = React.useState([])
  const [dataSource, setDataSourc] = React.useState([])
  const [filters, setFilters] = React.useState(null)

  const fetchDatastore = async (dataIndexSkip=0, retrieveCount=10, filters=null) => {
    try {
      const datastore = await api.datastore.getUserDatastore(
        session.userId,
        datastoreId
      )
      setDatastore(datastore)
      const dataColum = [{ title: 'Data Index', dataIndex: 'dataIndex' }]
      datastore.keys.forEach(keyName => {
        dataColum.push({
          title: keyName,
          dataIndex: keyName
        })
      })
      setDataColum(dataColum)
      const datastoreData = await api.datastore.getDatastoreData(
        datastoreId,
        dataIndexSkip,
        retrieveCount,
        filters
      )
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  const createDataEntry = async (values)=>{
    console.log(values)
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
      <Table
        dataSource={[]}
        style={{ marginTop: 20 }}
        bordered={false}
        columns={dataColum}
      />
      <div style={{marginTop: 20, background: 'white', padding: 10}}>

      <CreateDataEntryForm keys={datastore.keys} valueCallback={createDataEntry} />
      </div>
    </React.Fragment>
  )
}
