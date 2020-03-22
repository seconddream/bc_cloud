const { Router } = require('express')
const moment = require('moment')
const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider)
const c = require('ansi-colors')
const UserControl = require('../control/UserControl')

const router = new Router()

const isSelf = async (req, res, next) => {
  const { userId } = req.params
  if (['credential', 'login'].includes(userId)) {
    next()
    return
  }
  try {
    const {accountAddr} = await UserControl.getUser(userId)
    let tokenTimestamp = req.header('Token-Timestamp')
    let tokenSignature = req.header('Token-Signature')
    let actor = null
    try {
      actor = web3.eth.accounts.recover(tokenTimestamp, tokenSignature)
    } catch (error) {}
    const now = new moment.utc()
    const timeDiff = moment.duration(now.diff(new moment.utc(tokenTimestamp)))

    // console.log(c.red(`Path: ${req.path}`))
    // console.log(c.red(`Token-Timestamp: ${tokenTimestamp}`))
    // console.log(c.red(`Valid-Timestamp: ${now.format()}`))
    // console.log(c.red(`time_diff: ${timeDiff.as('seconds')}`))
    // console.log(c.red(`Token-Signature: ${tokenSignature}`))
    // console.log(c.red(`Account: ${accountAddr}`))
    // console.log(c.red(`Actor: ${actor}`))

    if(timeDiff.as('seconds') >= 300){
      throw new Error('Auth time out of bound.')
    }

    if(actor !== accountAddr)
      throw new Error('Identity validation failed.')

    next()
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
}

router.all('/user/:userId*', isSelf)

module.exports = router
