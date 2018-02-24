const screenName = process.argv[2]
const utils = require('./utils')
const fileUtils = require('./file-utils')

utils.get(screenName)
  .then(() => {
    console.log('done')
    fileUtils.writeFile(`data/${screenName}-current-following-fetched`, '')
  })
  .catch((err) => {
    setTimeout(() => {
      console.log(err)
      console.log('restarting...')

      utils.get(screenName)
    }, 1000 * 60 * 16)
  })
