const screenName = process.argv[2]
const utils = require('./utils')

utils.get(screenName)
  .then(() => {
    console.log('done')
  })
  .catch((err) => {
    setTimeout(() => {
      console.log(err)
      console.log('restarting...')

      utils.get(screenName)
    }, 1000 * 60 * 16)
  })
