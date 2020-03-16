import React from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button } from 'antd';

function CreateContractForm(props) {

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
      <Form.Item label="Contract Name">
        {getFieldDecorator('name', {
          rules: [
            {
              required: true,
              message: 'Please give a name to the contract.'
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

export default Form.create({ name: 'create_contract' })(CreateContractForm)
