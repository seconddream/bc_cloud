import React from 'react'
import { Form, Input, Button, message } from 'antd'

import api from '../api/index'

function ChainConfigurationForm(props) {
  const [dataValueUpdateForm] = Form.useForm()
  const { datastoreId, contractId, rowIndex, column, refresh } = props
  const { columnIndex, columnName, columnDataType } = column

  const updateDataValue = async () => {
    try {
      const { dataValue } = dataValueUpdateForm.getFieldsValue()
      await api.datastore.updateDataStoreDataValue(
        datastoreId,
        contractId,
        rowIndex,
        columnIndex,
        columnName,
        columnDataType,
        dataValue
      )
      await refresh()
    } catch (error) {
      console.log(error)
      message.error(error.message)
    }
  }

  return (
    <Form form={dataValueUpdateForm} onFinish={updateDataValue} layout="inline">
      <Form.Item label="New Value" name="dataValue">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ChainConfigurationForm
