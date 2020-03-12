import React from 'react'
import { Form, Input, Icon, Button, Checkbox, message } from 'antd'

function LoginForm(props) {

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
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Form style={{ maxWidth: '300px' }} onSubmit={handleSubmit}>
        <Form.Item>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input your E-mail!' }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true
          })(<Checkbox>Remember me</Checkbox>)}
          <a href="#" style={{ float: 'right' }}>
            Forgot password
          </a>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}


export default Form.create({ name: 'login' })(LoginForm)
