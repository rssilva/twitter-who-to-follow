const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')

const PATH = 'data-bkp/'

const getFirstLevelFollowing = (users, currentIndex = 0, secondLevelData = []) => {
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

const parseData = (firstLevelUsers, secondLevelUsers, filteredList) => {
  let data = []
  const added = []

  firstLevelUsers.forEach((firstLevelUser, index) => {
    const screenName = firstLevelUser.screen_name
    const imports = secondLevelUsers[index]
      .map((secondLevelUser) => secondLevelUser.screen_name)
      .filter((secondLevelUser) => filteredList.indexOf(secondLevelUser) !== -1)

    if (added.indexOf(screenName) === -1 && filteredList.indexOf(screenName) !== -1) {
      data.push({
        name: screenName,
        size: 0,
        imports
      })

      added.push(screenName)
    }
  })

  secondLevelUsers.forEach((secondLevelUserFollowing) => {
    secondLevelUserFollowing.forEach((secondLevelUser) => {
      const screenName = secondLevelUser.screen_name

      if (added.indexOf(screenName) === -1 && filteredList.indexOf(screenName) !== -1) {
        data.push({
          name: screenName,
          size: 0,
          imports: []
        })

        added.push(screenName)
      }
    })
  })

  return data
}

const filterData = (firstLevelUsers, secondLevelUsers) => {
  const counts = {}

  firstLevelUsers.forEach((firstLevelUser) => {
    const screenName = firstLevelUser.screen_name

    if (counts[screenName]) {
      counts[screenName] = counts[screenName] + 1
    }

    if (!counts[screenName]) {
      counts[screenName] = 1
    }
  })

  secondLevelUsers.forEach((secondLevelUserFollowing) => {
    secondLevelUserFollowing.forEach((secondLevelUser) => {
      const screenName = secondLevelUser.screen_name

      if (counts[screenName]) {
        counts[screenName] = counts[screenName] + 1
      }

      if (!counts[screenName]) {
        counts[screenName] = 1
      }
    })
  })

  fileUtils.writeFile('counts.json', JSON.stringify(counts))

  const filtered = filterUsers(counts, 50)

  return { filtered, counts }
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
      console.log('something wrong here?', item)
    }
  })

  const { filtered, counts } = filterData(firstLevelUsers, secondLevelUsers)
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const result = parseData(firstLevelUsers, secondLevelUsers, filtered)

  fileUtils.writeFile('result.json', JSON.stringify(result))

  const nonFollowedByRoot = result
    .filter((node) => firstLevelScreenNames.indexOf(node.name) === -1)
    .map((node) => {
      return {
        name: node.name,
        count: counts[node.name]
      }
    })

  console.log(_.sortBy(nonFollowedByRoot, 'count').reverse())
}).catch((err) => {
  console.log(err)
  throw err
})
