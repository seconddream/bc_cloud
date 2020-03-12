import React from 'react'
import { Form, Select, Button, InputNumber, Checkbox } from 'antd'

function ChainConfigurationForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback } = props
  const { chain } = props
  const { chainConfiguration, deployment } = chain

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback(values)
    })
  }

  return (
    <Form onSubmit={handleSubmit} layout='horizontal' labelCol={{span: 10, offset: 1}} wrapperCol={{span: 12, offset: 1}} >
      <Form.Item label="Chain Type">
        {getFieldDecorator('type', {
          initialValue: chainConfiguration ? chainConfiguration.type : '',
          rules: [{ required: true, message: 'Please select a chain type.' }]
        })(
          <Select disabled={deployment}>
            <Select.Option value="clique">clique</Select.Option>
          </Select>
        )}
      </Form.Item>

      <Form.Item label="Sealer Node Count">
        {getFieldDecorator('sealerNodeCount', {
          initialValue: chainConfiguration
            ? chainConfiguration.sealerNodeCount
            : 1,
          rules: [{ required: true, message: 'Seal node count must be given.' }]
        })(<InputNumber min={1} max={3} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="Transaction Node Count">
        {getFieldDecorator('transactionNodeCount', {
          initialValue: chainConfiguration
            ? chainConfiguration.transactionNodeCount
            : 1,
          rules: [
            {
              required: true,
              message: 'Transaction node count must be given.'
            }
          ]
        })(<InputNumber min={1} max={5} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="Gas Price">
        {getFieldDecorator('gasPrice', {
          initialValue: chainConfiguration ? chainConfiguration.gasPrice : 0,
          rules: [
            {
              required: true,
              message: 'Gas price must be given.'
            }
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="Gas Limit">
        {getFieldDecorator('gasLimit', {
          initialValue: chainConfiguration ? chainConfiguration.gasLimit : 9000000,
          rules: [
            {
              required: true,
              message: 'Gas limit must be given.'
            }
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="Gas Target">
        {getFieldDecorator('gasTarget', {
          initialValue: chainConfiguration ? chainConfiguration.gasTarget : 8000000,
          rules: [
            {
              required: true,
              message: 'Gas target must be given.'
            }
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="TXPool Price Limit">
        {getFieldDecorator('txpoolPriceLimit', {
          initialValue: chainConfiguration ? chainConfiguration.txpoolPriceLimit : 0,
          rules: [
            {
              required: true,
              message: 'TX pool price limit must be given.'
            }
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item>

      {/* <Form.Item label="Init accounts">
        {getFieldDecorator('initAccount', {
          initialValue: chainConfiguration ? chainConfiguration.initAccount : 0,
          rules: [
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item>

      <Form.Item label="Pre-fund">
        {getFieldDecorator('prefund', {
          initialValue: chainConfiguration ? chainConfiguration.prefund : 0,
          rules: [
          ]
        })(<InputNumber min={0} disabled={deployment} />)}
      </Form.Item> */}

      <Form.Item label="Expose to Public">
        {getFieldDecorator('expose', {
          rules: [
          ]
        })(<Checkbox />)}
      </Form.Item>

      <Form.Item style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button type="primary" htmlType="submit" disabled={deployment}>
          OK
        </Button>
      </Form.Item>
      
    </Form>
  )
}

export default Form.create({ name: 'chain_configuration' })(
  ChainConfigurationForm
)
