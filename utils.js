const Twit = require('twit')
const fs = require('fs')
const fileUtils = require('./file-utils')
const config = require('./config')
const { removeDupes } = require('./arrays-utils')
require('colors')

const twit = new Twit({
  consumer_key: config.CONSUMER_KEY,
  consumer_secret: config.CONSUMER_SECRET,
  app_only_auth: true
})

const getFollowing = (screenName, cursor = -1, following = []) => {
  return twit.get('friends/list', { screen_name: screenName, cursor: cursor })
    .then((res) => {
      const data = res.data
      const errors = data.errors || []

      if (errors.length) {
        console.error(`There were some errors while handling data for ${screenName}. You can exit process and the progress will not be lost`.red)
        console.error(errors)

        return Promise.reject(errors)
      }

      const nextCursor = data.next_cursor
      const users = data.users || []

      following = following.concat(users)

      saveFollowing(screenName, removeDupes(following, 'id'))
      saveCursor(screenName, nextCursor)

      if (!errors.length && nextCursor !== 0 && nextCursor !== undefined) {
        console.log(`fetching ${screenName} with cursor ${nextCursor}. Current array size is ${following.length}`)

        const lastUser = users[users.length - 1] || {}

        saveLastFollowingFetched(screenName, lastUser.screen_name)

        return getFollowing(screenName, nextCursor, following)
      }

      if (!errors.length && (nextCursor === 0 || nextCursor === undefined)) {
        const lastUser = following[following.length - 1] || {}

        saveLastFollowingFetched(screenName, lastUser.screen_name)

        console.log(`It seems that things are finished to find data for ${screenName}! The total size of the array is ${following.length}`.green)

        return Promise.resolve(following)
      }
    })
}

const saveFollowing = (screenName, following) => {
  fs.writeFile(`data/${screenName}-following.json`, JSON.stringify(following))
}

const saveCursor = (screenName, currentCursor) => {
  fs.writeFile(`data/${screenName}-current-cursor`, JSON.stringify(currentCursor))
}

const saveLastFollowingFetched = (screenName, lastUserFetched) => {
  fs.writeFile(`data/${screenName}-current-following-fetched`, lastUserFetched)
}

const setFiles = (screenName) => {
  const cursor = `data/${screenName}-current-cursor`
  const following = `data/${screenName}-following.json`
  const currentFollowing = `data/${screenName}-current-following-fetched`

  const files = [
    {file: cursor, data: '-1'},
    {file: following, data: '[]'},
    {file: currentFollowing, data: ''}
  ]

  const promises = files.map((fileData) => {
    return setInitialFile(fileData.file, fileData.data)
  })

  return Promise.all(promises)
}

const setInitialFile = (file, data) => {
  return new Promise((resolve) => {
    fileUtils.stat(file)
      .then(() => {
        resolve()
      })
      .catch(() => {
        fileUtils.writeFile(file, data).then(() => resolve())
      })
  })
}

const get = (screenName) => {
  return setFiles(screenName)
    .then(() => {
      return fileUtils.readFile(`data/${screenName}-current-cursor`)
    }).then((currentCursor) => {
      currentCursor = currentCursor.trim()

      return fileUtils.readFile(`data/${screenName}-following.json`).then((following) => {
        following = JSON.parse(following)

        console.log(`getting who ${screenName} is following starting cursor on ${currentCursor} at ${new Date()}`.green)

        return getFollowing(screenName, currentCursor, following)
      })
    })
}

module.exports = {
  get
}
