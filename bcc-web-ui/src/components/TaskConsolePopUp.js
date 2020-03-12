import React from 'react'
import moment from 'moment'
import { Modal, Typography } from 'antd'
import { UserSessionContext } from '../contexts/UserSessionContext'
import api from '../api/index'

const LogType = {
  INFO: 'secondary',
  WARNING: 'warning',
  ERROR: 'danger'
}

export default function TaskConsolePopUp(props) {
  const { taskId, onClose } = props
  const { session } = React.useContext(UserSessionContext)
  const [task, setTask] = React.useState(null)

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setTask(await api.task.getUserTask(session.userId, taskId))
      } catch (error) {
        console.log(error)
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <React.Fragment>
      <Modal
        onCancel={onClose}
        width={800}
        visible
        title={
          task ? (
            <React.Fragment>
              <Typography.Text strong>{task.name} </Typography.Text>
              <Typography.Text code>{task.status}</Typography.Text>
            </React.Fragment>
          ) : (
            <Typography.Text strong>Loading Task...</Typography.Text>
          )
        }
      >
        {task ? (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {[...task.logs].sort((a,b)=>a.timestamp>b.timestamp).map((log, index) => (
              <React.Fragment key={`log_index_${index}`}>
                <Typography.Text type={LogType[log.type]}>{`${moment(
                  log.timestamp
                ).format('')} [${log.type}] ${log.message}`}</Typography.Text>
                <br />
              </React.Fragment>
            ))}
          </div>
        ) : null}
        <Typography.Text></Typography.Text>
      </Modal>
    </React.Fragment>
  )
}
