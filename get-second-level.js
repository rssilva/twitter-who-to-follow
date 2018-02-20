const fileUtils = require('./file-utils')
const _ = require('lodash')
const rootUser = process.argv[2]
const utils = require('./utils')
const { removeDupes } = require('./arrays-utils')
const config = require('./config')

fileUtils.readFile(`data/${rootUser}-following.json`)
  .then((following) => {
    following = JSON.parse(following)

    const sorted = _.sortBy(following, 'friends_count')
      .filter((user) => user.friends_count <= config.FOLLOWING_MAX_LIMIT)

    const unique = removeDupes(sorted, 'id')

    fileUtils.readFile(`data/${rootUser}-current-following-fetched`).then((currentFollowing) => {
      let index = _.findIndex(unique, { screen_name: currentFollowing.trim() }) + 1

      getData(unique, index)
    })
  })

const getData = (users, currentIndex) => {
  console.log(currentIndex)

  if (users[currentIndex]) {
    const currentScreenName = users[currentIndex].screen_name

    utils.get(currentScreenName).then(() => {
      fileUtils.writeFile(`data/${rootUser}-current-following-fetched`, currentScreenName)

      currentIndex++

      getData(users, currentIndex)
    })
      .catch((err) => {
        console.log(err)

        setTimeout(() => {
          console.log('restarting...')

          getData(users, currentIndex)
        }, 60 * 1000 * 16)
      })
  } else {
    return null
  }
}
