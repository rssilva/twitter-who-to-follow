const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')

const PATH = 'data-bkp/'

const getFirstLevelFollowing = (users, currentIndex = 0, secondLevelData = []) => {
  const deferred = Promise.defer()
  const firstLevelUser = users[currentIndex]

  return fileUtils
    .readFile(`./${PATH}${firstLevelUser.screen_name}-following.json`)
    .then((data) => {
      currentIndex++

      const parsed = JSON.parse(data)

      secondLevelData.push(removeDupes(parsed, 'id').map((user = {}) => {
        return {
          screen_name: user.screen_name,
          location: user.location,
          description: user.description,
          followers_count: user.followers_count,
          friends_count: user.friends_count,
          listed_count: user.listed_count,
        }
      }))

      data = null

      return getNextIfExists(users, currentIndex, secondLevelData)
    })
    .catch(() => {
      currentIndex++
      secondLevelData.push([])

      return getNextIfExists(users, currentIndex, secondLevelData)
    })
}

const getNextIfExists = (users, currentIndex, secondLevelData) => {
  if (users[currentIndex]) {
    return getFirstLevelFollowing(users, currentIndex, secondLevelData)
  } else {
    return secondLevelData
  }
}

const removeDupes = (arr, prop) => {
  const unique = []
  const alreadyAdded = {}

  arr.forEach((item) => {
    if (!alreadyAdded[item[prop]]) {
      unique.push(item)

      alreadyAdded[item[prop]] = true
    }
  })

  return unique
}

fileUtils.readFile(`./${PATH}${rootUser}-following.json`).then((data) => {
  const rootUserData = removeDupes(JSON.parse(data), 'id')

  return rootUserData
}).then((firstLevelUsers) => {
  return Promise.all([
    firstLevelUsers,
    getFirstLevelFollowing(firstLevelUsers)
  ])
})
.then(([firstLevelUsers, secondLevelUsers]) => {
  return Promise.all([
    firstLevelUsers,
    secondLevelUsers
  ])
})
.then(([firstLevelUsers, secondLevelUsers]) => {
  const followingCounts = firstLevelUsers.map((user = {}, index) => {
    const screenName = user.screen_name
    const secondLevelData = secondLevelUsers[index]
    const secondLevelUsersUnique = removeDupes(secondLevelData, 'screen_name')

    return {screenName, followingCount: user.friends_count, checked: secondLevelUsersUnique.length }
  })

  followingCounts.forEach((item) => {
    if (Math.abs(item.followingCount) - Math.abs(item.checked) > 3 && item.checked !== 0) {
      console.log(item)
    }
  })
}).catch((err) => {
  console.log(err)
  throw err
})
