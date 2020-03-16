import React from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Select, Typography } from 'antd';


function CreateServiceForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback } = props
  const { contract } = props

  const handleSubmit = e => {
    const { contractId } = contract
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback({ ...values, contractId })
    })
  }

  if(!contract) return null

  return (
    <Form onSubmit={handleSubmit}>
      <Typography.Title level={4}>Contract {contract.name}</Typography.Title>
      <Form.Item label="Service Name">
        {getFieldDecorator('serviceName', {
          rules: [
            {
              required: true,
              message: 'Please give a service name.'
            }
          ]
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item label="Function">
        {getFieldDecorator('functionName', {
          rules: [
            {
              required: true,
              message: 'Please choose a function.'
            }
          ]
        })(
          <Select>
            {contract.abi
              .filter(c => c.type === 'function')
              .map((func, index) => (
                <Select.Option
                  value={`${func.name}`}
                  key={`func_name_${index}`}
                >
                  {func.name}
                </Select.Option>
              ))}
          </Select>
        )}
      </Form.Item>
      <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" htmlType="submit">
          Confirm
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({ name: 'create_service' })(CreateServiceForm)
