const fileUtils = require('./file-utils')
const { removeDupes } = require('./object-utils')
// const _ = require('lodash')
const PATH = 'data-bkp/'

const getCurrentLevelData = (users, path, currentIndex = 0, nextLevelData = []) => {
  const currentLevelUser = users[currentIndex][0]

  return fileUtils
    .readFile(`./${path}${currentLevelUser.screen_name}-following.json`)
    .then((data) => {
      currentIndex++

      const parsed = JSON.parse(data)

      nextLevelData.push(removeDupes(parsed, 'id').map((user = {}) => {
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

      return getNextIfExists(users, path, currentIndex, nextLevelData)
    })
    .catch(() => {
      currentIndex++
      nextLevelData.push([])

      return getNextIfExists(users, path, currentIndex, nextLevelData)
    })
}

const getNextIfExists = (users, path, currentIndex, secondLevelData) => {
  if (users[currentIndex]) {
    return getCurrentLevelData(users, path, currentIndex, secondLevelData)
  } else {
    return secondLevelData
  }
}

const getLevels = (rootUser, path = PATH) => {
  return getRootData(rootUser, path)
    .then((firstLevelUsers) => {
      return Promise.all([
        firstLevelUsers,
        getCurrentLevelData(firstLevelUsers, path)
      ])
    })
}

const getRootData = (rootUser, path) => {
  return fileUtils.readFile(`./${path}${rootUser}-following.json`).then((data) => {
    const rootUserData = removeDupes(JSON.parse(data), 'id')

    return rootUserData.map((user) => [user])
  })
}

const getCounts = (levels) => {
  const counts = {}

  levels.forEach((level) => {
    level.forEach((levelUsers) => {
      levelUsers.forEach((levelUser) => {
        const screenName = levelUser.screen_name

        if (counts[screenName]) {
          counts[screenName] = counts[screenName] + 1
        }

        if (!counts[screenName]) {
          counts[screenName] = 1
        }
      })
    })
  })

  return counts
}

const calculateScore = (levels, counts) => {
  const score = {}

  levels.forEach((level, levelIndex) => {
    level.forEach((levelUsers, levelUserIndex) => {
      levelUsers.forEach((levelUser) => {
        const nextLevel = levels[levelIndex + 1]

        if (nextLevel) {
          const nextLevelUsers = nextLevel[levelUserIndex]

          nextLevelUsers.forEach((nextLevelUser) => {
            if (!score[nextLevelUser.screen_name]) {
              score[nextLevelUser.screen_name] = 0
            }

            score[nextLevelUser.screen_name] += counts[levelUser.screen_name]
          })
        }
      })
    })
  })

  return score
}

module.exports = {
  getLevels,
  calculateScore,
  getCounts
}
