const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')
const analysisUtils = require('./analysis-utils')
const { removeDupes } = require('./object-utils')

const PATH = 'data-bkp/'

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

analysisUtils.getLevels(rootUser, PATH).then(([firstLevelUsers, secondLevelUsers]) => {
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
