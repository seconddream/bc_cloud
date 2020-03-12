const c = require('ansi-colors')
const { callDBGate } = require('./connection')
const TaskRunner = require('./TaskRunner')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const pause = timeout =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })

const run = async () => {
  console.log(c.gray('Chain Agent starting monitoring task queue...'))
  while (true) {
    try {
      await pause(Math.random() * 1000)
      // fetch task from queue
      try {
        const task = await callDBGate('/task/getOneTaskFromQueue')
        if (task === 'NO_TASK') {
          continue
        }
        console.log(c.gray(`AGENT GOT NEW TASK: \\n ${JSON.stringify(task)}`))
        // run task
        await TaskRunner.run(task)
      } catch (error) {
        console.log(c.red('Agent to DBGate connection failed.'))
      }

    } catch (error) {
      console.log(error)
    }
  }
}

run()
