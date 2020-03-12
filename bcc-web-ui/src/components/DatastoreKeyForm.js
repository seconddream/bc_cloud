import React from 'react'
import { Form, Input, Button, Select, Row, Col } from 'antd'

const dataType = {
  string: 0,
  int: 1,
  float: 2,
  boolean: 3
}

const dataTypeIndex = [
  'string', 'int', 'float', 'boolean'
]

function DatastoreKeyForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback, refreshCallback } = props

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback(values)
    })
  }

  return (
    <Form onSubmit={handleSubmit} colon={false}>
      <Row gutter={10} style={{ marginTop: 10 }}>
        <Col span={8}>
          <Form.Item label="Key Name">
            {getFieldDecorator('keyName', {
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
            {getFieldDecorator('dataType', {
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
            <Button type="primary" htmlType="submit" style={{marginRight: 10}}>
              Add Key
            </Button>
            <Button type="primary" onClick={refreshCallback}>
              Refresh
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default Form.create({ name: 'datastore_key' })(DatastoreKeyForm)
