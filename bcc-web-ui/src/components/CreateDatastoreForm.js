import React from 'react'
import { DeleteOutlined } from '@ant-design/icons'
import { Form, Input, Button, Select, Row, Col, Table } from 'antd'

const dataType = {
  string: 0,
  int: 1,
  float: 2,
  boolean: 3
}

const dataTypeIndex = ['string', 'int', 'float', 'boolean']

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
}

function CreateDatastoreForm(props) {
  const { valueCallback } = props
  const [form] = Form.useForm()
  const [columns, setColumns] = React.useState([])

  const appendColumn = async () => {
    await form.validateFields(['columnName', 'columnDataType'])
    const { columnName, columnDataType } = form.getFieldsValue()
    const newColumns = [...columns]
    newColumns.push({
      key: columns.length,
      columnIndex: columns.length,
      columnName,
      columnDataType
    })
    setColumns(newColumns)
    form.resetFields(['columnName', 'columnDataType'])
  }

  const removeColumn = columnIndex => {
    console.log(columnIndex)
    const newColumns = columns
      .filter(c => c.columnIndex !== columnIndex)
      .map((c, i) => {
        return { ...c, columnIndex: i }
      })
    setColumns(newColumns)
  }

  const handleSubmit = async ()=>{
    await form.validateFields(['name', 'type'])
    const {name, type} = form.getFieldsValue()
    const values = {name, type, columns}
    valueCallback(values)
  }

  return (
    <React.Fragment>
      <Form {...layout} form={form} colon={false}>
        <Form.Item
          label="Datastore Name"
          name="name"
          rules={[
            { required: true, message: 'Please give a name to the datastore.' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Datastore Type"
          name="type"
          rules={[
            {
              required: true,
              message: 'Please select a type to the datastore.'
            }
          ]}
        >
          <Select>
            <Select.Option value="Datastore">Datastore</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Column Name"
          name="columnName"
          rules={[
            ()=>({
              validator(rule, value){
                if(columns.filter(c=>c.columnName===value).length === 0){
                  return Promise.resolve()
                }else{
                  return Promise.reject('Column name already used.')
                }
              }
            })
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Column Data Type"
          name="columnDataType"
          rules={[
            {
              required: true,
              message: 'Please select a type to the column.'
            }
          ]}
        >
          <Select>
            <Select.Option value="string">String</Select.Option>
            <Select.Option value="boolean">boolean</Select.Option>
            <Select.Option value="integer">Integer</Select.Option>
            <Select.Option value="number">Number</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button
            type="default"
            onClick={appendColumn}
            style={{ marginRight: 10 }}
          >
            Append Column
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Create
          </Button>
        </Form.Item>
      </Form>
      <Table
        dataSource={columns}
        style={{ marginTop: 10 }}
        pagination={false}
        size="small"
      >
        <Table.Column title="Column Index" dataIndex="columnIndex" />
        <Table.Column title="Name" dataIndex="columnName" />
        <Table.Column title="Data Type" dataIndex="columnDataType" />
        <Table.Column
          title="Action"
          render={(text, record, index) => {
            return (
              <Button
                onClick={() => {
                  removeColumn(record.columnIndex)
                }}
                icon={<DeleteOutlined />}
              ></Button>
            )
          }}
        />
      </Table>
    </React.Fragment>
  )
}

export default CreateDatastoreForm
