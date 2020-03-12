const c = require('ansi-colors')
const moment = require('moment')
const { callDBGate } = require('./connection')

const emitLog = (taskId, type, message) => {
  switch (type) {
    case 'INFO':
      console.log(c.cyanBright(message))
      break
    case 'WARNING':
      console.log(c.yellowBright(message))
      break
    case 'ERROR':
      console.log(c.redBright(message))
      break
    case 'DEBUG':
      if (typeof message === 'string') {
        console.log(c.whiteBright(message))
      } else {
        console.log(c.whiteBright(JSON.stringify(message, null, 2)))
      }
      break
    default:
      console.log(c.whiteBright(message))
  }
  if (type !== 'DEBUG') {
    callDBGate('/task/appendLog', {
      taskId,
      type,
      timestamp: moment().valueOf(),
      message
    })
  }
}

const getTaskLogger = taskId => {
  return {
    info: message => {
      emitLog(taskId, 'INFO', message)
    },
    debug: message => {
      emitLog(taskId, 'DEBUG', message)
    },
    error: message => {
      emitLog(taskId, 'ERROR', message)
    },
    warning: message => {
      emitLog(taskId, 'WARNING', message)
    },
    start: () => {
      emitLog(taskId, 'INFO', `Task ${taskId} started.`)
    },
    end: () => {
      emitLog(taskId, 'INFO', `Task ${taskId} ended.`)
    }
  }
}

module.exports = {
  getTaskLogger
}
