import React from 'react'
import { Form, Input, Button, Select, Typography, Row, Col, Tag } from 'antd'

function CallServiceForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback } = props
  const { abi, serviceId } = props

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      values.serviceId = serviceId
      valueCallback(values)
    })
  }

  return (
    <Form onSubmit={handleSubmit} colon={false} layout="inline">
      <Row>
        <Col span={3}>
          <Tag color='blue'>Arguments</Tag>
        </Col>
        <Col span={21}>
          <Row>
            {abi.inputs.map((input, index) => (
              <Col
                span={24}
                key={`callargs_${index}`}
                style={{
                  background: '#f0f0f0',
                  padding: 5,
                  paddingLeft: 10,
                  marginBottom: 5
                }}
              >
                <Form.Item label={`${input.name} [${input.type}]`}>
                  {getFieldDecorator(`callArgs.${index}`, {
                    rules: [
                      {
                        required: true,
                        message: 'Please fill the argument.'
                      }
                    ]
                  })(<Input />)}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10
            }}
          >
            <span>
              {abi.inputs.length === 0
                ? 'No argument, call directly.'
                : `${abi.inputs.length} arguments required for this service.`}
            </span>
            <Button type="primary" htmlType="submit" style={{ float: 'right' }}>
              Call
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  )
}

export default Form.create({ name: 'call_service' })(CallServiceForm)
