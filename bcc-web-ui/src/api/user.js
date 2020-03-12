import Web3 from 'web3'
import { APIGate } from './connection'

const web3 = new Web3(Web3.givenProvider)
export const getUser = async userId => {
  return await APIGate.get(`/user/${userId}`)
}

export const login = async (email, password, remember) => {
  const { keystore, token } = await APIGate.post('/user/credential', { email })
  let account = null
  try {
    account = web3.eth.accounts.decrypt(keystore, password)
  } catch (error) {
    throw new Error('Fail to recover account.')
  }
  const signedObject = web3.eth.accounts.sign(token, account.privateKey)
  const signedToken = signedObject.signature
  const { userId } = await APIGate.post('/user/login', {
    email,
    signedToken
  })
  const user = { userId, signedToken, account }
  if (remember) {
    window.localStorage.setItem('bcc_session', JSON.stringify(user))
  }
  return user
}

export const signUp = async (email, password) => {
  const account = web3.eth.accounts.create()
  const keystore = web3.eth.accounts.encrypt(account.privateKey, password)
  await APIGate.post('/user', {
    email,
    accountAddr: account.address,
    keystore
  })
}

export const getLocalSession = () => {
  const session = window.localStorage.getItem('bcc_session')
  if (session) {
    return JSON.parse(session)
  } else {
    return null
  }
}

export const removeLocalSession = async () => {
  window.localStorage.removeItem('bcc_session')
}
