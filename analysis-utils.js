const fileUtils = require('./file-utils')
const { removeDupes } = require('./arrays-utils')
const _ = require('lodash')
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
          listed_count: user.listed_count
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

const filterUsers = (counts, limit = 10) => {
  const toAdd = []
  const keys = Object.keys(counts)

  console.log('total users:', keys.length)

  keys.forEach((key) => {
    if (counts[key] > limit) {
      toAdd.push(key)
    }
  })

  console.log('should add', toAdd.length)

  return toAdd
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

const validateCounts = (levels) => {
  const firstLevelUsers = _.flatMap(levels[0])
  const secondLevelUsers = levels[1]

  const inconsistentUsers = firstLevelUsers
    .filter((user = {}, index) => {
      const screenName = user.screen_name
      const secondLevelData = secondLevelUsers[index]
      const secondLevelUsersUnique = removeDupes(secondLevelData, 'screen_name')

      // difference between friends_count user data and the total users fetched by the api
      const diff = Math.abs(user.friends_count) - Math.abs(secondLevelUsersUnique.length)

      if (diff > 3 && secondLevelUsersUnique.length !== 0) {
        console.log('something wrong here?', screenName, user.friends_count, secondLevelUsersUnique.length)

        return screenName
      }

      return false
    })
    .map((user) => user.screen_name)

  return inconsistentUsers
}

// this method parses the levels data to the d3.js graph
const parseData = (levels, toBeAdded) => {
  let data = []

  // this array will avoid to add users more than once
  const added = []

  levels.forEach((level, levelIndex) => {
    level.forEach((levelUsers, levelUserIndex) => {
      levelUsers.forEach((levelUser) => {
        const screenName = levelUser.screen_name
        const nextLevel = levels[levelIndex + 1]
        const imports = levelIndex > 0 ? [] : getImports(nextLevel, levelUserIndex, toBeAdded)

        if (added.indexOf(screenName) === -1 && toBeAdded.indexOf(screenName) !== -1) {
          data.push({
            name: screenName,
            size: 0,
            imports,
            location: levelUser.location,
            description: levelUser.description
          })

          added.push(screenName)
        }
      })
    })
  })

  return data
}

const getImports = (nextLevelUsers, levelUserIndex, filteredList) => {
  const imports = nextLevelUsers[levelUserIndex]
    .map((levelUser) => levelUser.screen_name)
    .filter((secondLevelUser) => filteredList.indexOf(secondLevelUser) !== -1)

  return imports
}

module.exports = {
  getLevels,
  calculateScore,
  getCounts,
  filterUsers,
  validateCounts,
  parseData
}
