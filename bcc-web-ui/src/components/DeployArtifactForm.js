import React from 'react'
import { Form, Input, Button, Select, Typography } from 'antd'
import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'


function DeployArtifactForm(props) {
  const { getFieldDecorator, validateFields } = props.form
  const { valueCallback, abi } = props
  const { session } = React.useContext(UserSessionContext)
  const [userChainList, setUserChainList] = React.useState([])

  const handleSubmit = e => {
    e.preventDefault()
    validateFields(async (err, values) => {
      if (err) return
      valueCallback(values)
    })
  }

  React.useEffect(() => {
    async function init() {
      const chainList = await api.chain.getUserChainList(session.userId)

      setUserChainList(
        chainList.filter(
          chain =>
            chain.status === 'Deployed'
        )
      )
    }
    init()
  }, [])

  return (
    <Form onSubmit={handleSubmit} colon={false}>
      <Form.Item label="Target Chain Deployment">
        {getFieldDecorator('chainId', {
          rules: [
            {
              required: true,
              message: 'Please choose a chain.'
            }
          ]
        })(
          <Select onChange={() => {}}>
            {userChainList.map(chain => (
              <Select.Option value={`${chain.chainId}`} key={chain.chainId}>
                {chain.name}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>
      {/* <Form.Item label="Arguments">
        {getFieldDecorator('args', {
          rules: []
        })(<Input.TextArea autoSize={{ minRows: 5 }} />)}
      </Form.Item> */}
      {abi.filter(e => e.type === 'constructor').length === 1 ? (
        <React.Fragment>
          <Typography.Title level={4}>Constructor</Typography.Title>
          {abi
            .filter(e => e.type === 'constructor')[0]
            .inputs.map((e, index) => (
              <Form.Item label={`${e.name}: ${e.type}`} key={`arg_${index}`}>
                {getFieldDecorator(`args.${index}`, {
                  rules: [
                    {
                      required: true,
                      message: 'Value missing.'
                    }
                  ]
                })(<Input />)}
              </Form.Item>
            ))}
        </React.Fragment>
      ) : null}

      <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" htmlType="submit">
          Confirm
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({ name: 'deploy_artifact' })(DeployArtifactForm)
