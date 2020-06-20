import React from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';

function PerformanceTestForm(props) {

  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback } = props

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback(values)
    })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item label="Private Key">
        {getFieldDecorator('pk', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="ServiceId 1c">
        {getFieldDecorator('serviceId1c', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="ServiceId 1t">
        {getFieldDecorator('serviceId1t', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="ServiceId 2c">
        {getFieldDecorator('serviceId2c', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="ServiceId 2t">
        {getFieldDecorator('serviceId2t', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Datastore Id">
        {getFieldDecorator('datastoreId', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Contract Id">
        {getFieldDecorator('contractId', {
          rules: [
            {
              required: true,
            }
          ]
        })(<Input />)}
      </Form.Item>
      <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" htmlType="submit">
          Create
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({ name: 'p_test' })(PerformanceTestForm)
