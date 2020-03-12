import React from 'react'
import { Form, Input, Button } from 'antd'

function CreateDataEntryForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback, keys } = props

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback(values)
    })
  }

  if (!keys) return null
  return (
    <Form layout="inline" onSubmit={handleSubmit}>
      {keys.map(keyName => (
        <Form.Item label={keyName} key={`create_data_entry_form_${keyName}`}>
          {getFieldDecorator(keyName, {
            initialValue: ''
          })(<Input />)}
        </Form.Item>
      ))}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon="check-circle"
          style={{ marginRight: 10 }}
        />
        <Button type="danger" icon="close-circle" />
      </Form.Item>
    </Form>
  )
}

export default Form.create({ name: 'create_data_entry' })(CreateDataEntryForm)
