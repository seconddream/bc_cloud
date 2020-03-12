import React from 'react'
import { Form, Input, Button, Select, Row, Col, Table } from 'antd'

const dataType = {
  string: 0,
  int: 1,
  float: 2,
  boolean: 3
}

const dataTypeIndex = ['string', 'int', 'float', 'boolean']

function CreateDatastoreForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback } = props
  const [keys, setKeys] = React.useState([])

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(['name', 'type'], async (err, values) => {
      if (err) return
      values.schema = {}
      for (let i = 0; i < keys.length; i++) {
        values.schema[i] = {
          keyName: keys[i].keyName,
          dataType: keys[i].dataType
        }
      }
      valueCallback(values)
    })
  }

  const addKey = () => {
    validateFields(['addKeyName', 'addDatatype'], async (err, values) => {
      if (err) return
      const { addKeyName, addDatatype } = values
      setKeys([
        ...keys,
        {
          keyName: addKeyName,
          dataType: addDatatype,
          dataTypeName: dataTypeIndex[addDatatype],
          key: keys.length
        }
      ])
    })
  }

  return (
    <Form onSubmit={handleSubmit} colon={false}>
      <Form.Item label="Datastore Name">
        {getFieldDecorator('name', {
          rules: [
            {
              required: true,
              message: 'Please give a name to the datastore.'
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Datastore Name">
        {getFieldDecorator('type', {
          rules: [
            {
              required: true,
              message: 'Please select a type.'
            }
          ]
        })(
          <Select>
            <Select.Option value="Datastore">Datastore</Select.Option>
          </Select>
        )}
      </Form.Item>

      <Table
        dataSource={keys}
        style={{ marginTop: 10 }}
        pagination={false}
        size="small"
      >
        <Table.Column
          title="Key ID"
          dataIndex="keyId"
          render={(text, record, index) => index}
        />
        <Table.Column title="Name" dataIndex="keyName" />
        <Table.Column title="Data Type" dataIndex="dataTypeName" />
        <Table.Column
          title="Action"
          render={(text, record, index) => {
            // console.log(record)
            return (
              <Button
                onClick={() => {
                  setKeys(keys.filter((k, i) => i !== index))
                }}
                icon="delete"
              ></Button>
            )
          }}
        />
      </Table>

      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={8}>
          <Form.Item label="Key Name">
            {getFieldDecorator('addKeyName', {
              rules: [
                {
                  required: true,
                  message: 'Please give a key name.'
                }
              ]
            })(<Input />)}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Data Type">
            {getFieldDecorator('addDatatype', {
              rules: [
                {
                  required: true,
                  message: 'Please select a key data type.'
                }
              ]
            })(
              <Select>
                {Object.keys(dataType).map(k => (
                  <Select.Option
                    key={`createKey_datatype_${k}`}
                    value={dataType[k]}
                  >
                    {k}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label=" ">
            <Button type="primary" onClick={addKey}>
              Add Key
            </Button>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({ name: 'create_datastore' })(CreateDatastoreForm)
