const { callDBGate } = require('../connection')

const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider)
const moment = require('moment')
const c = require('ansi-colors')

const getActorFromReq = req => {
  const tokenTimestamp = req.header('Token-Timestamp')
  const tokenSignature = req.header('Token-Signature')
  const actor = web3.eth.accounts.recover(tokenTimestamp, tokenSignature)
  const now = new moment.utc()
  const timeDiff = moment.duration(now.diff(new moment.utc(tokenTimestamp)))

  // console.log(c.red(`Path: ${req.path}`))
  // console.log(c.red(`Token-Timestamp: ${tokenTimestamp}`))
  // console.log(c.red(`Valid-Timestamp: ${now.format()}`))
  // console.log(c.red(`time_diff: ${timeDiff.as('seconds')}`))
  // console.log(c.red(`Token-Signature: ${tokenSignature}`))
  // console.log(c.red(`Actor: ${actor}`))

  if (timeDiff.as('seconds') >= 300) {
    throw new Error('Token expired.')
  }

  return actor
}

const readAccess = async parentId => {
  const access = await callDBGate('/access/readAccess', { parentId })
  return access
}

const appendActorToList = async (parentId, actor, listNames = []) => {
  await callDBGate('/access/appendActorToList', {
    parentId,
    actor,
    listNames
  })
}

const removeActorFromList = async (parentId, actor, listNames = []) => {
  await callDBGate('/access/removeActorFromList', {
    parentId,
    actor,
    listNames
  })
}

const canRead = async (parentId, actor) => {
  const access = await callDBGate('/access/readAccess', { parentId })
  if (access.blackList.includes(actor)) return false
  if (access.readWhiteList.length === 0) return true
  return access.readWhiteList.includes(actor)
}

const canWrite = async (parentId, actor) => {
  const access = await callDBGate('/access/readAccess', { parentId })
  if (access.blackList.includes(actor)) return false
  if (access.writeWhiteList.length === 0) return true
  return access.writeWhiteList.includes(actor)
}

module.exports = {
  getActorFromReq,
  readAccess,
  appendActorToList,
  removeActorFromList,
  canRead,
  canWrite
}
