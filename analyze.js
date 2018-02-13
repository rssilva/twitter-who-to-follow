const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')
const analysisUtils = require('./analysis-utils')
const { removeDupes } = require('./object-utils')

const PATH = 'data-bkp/'

const parseData = (levels, filteredList) => {
  let data = []
  const added = []

  levels.forEach((level, levelIndex) => {
    level.forEach((levelUsers) => {
      levelUsers.forEach((levelUser) => {
        const screenName = levelUser.screen_name
        const imports = levelIndex > 0 ? [] : getImports(levels[levelIndex + 1], levelIndex, filteredList)

        if (added.indexOf(screenName) === -1 && filteredList.indexOf(screenName) !== -1) {
          data.push({
            name: screenName,
            size: 0,
            imports
          })

          added.push(screenName)
        }
      })
    })
  })

  return data
}

const getImports = (nextLevelUsers, currentIndex, filteredList) => {
  const imports = nextLevelUsers[currentIndex]
    .map((levelUser) => levelUser.screen_name)
    .filter((secondLevelUser) => filteredList.indexOf(secondLevelUser) !== -1)

  return imports
}

const filterData = (levels) => {
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

const validateCounts = (levels) => {
  const firstLevelUsers = _.flatMap(levels[0])
  const secondLevelUsers = levels[1]

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
}

analysisUtils.getLevels(rootUser, PATH).then((levels) => {
  const firstLevelUsers = _.flatMap(levels[0])

  validateCounts(levels)

  const { filtered, counts } = filterData(levels)
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const result = parseData(levels, filtered)

  fileUtils.writeFile('result.json', JSON.stringify(result))

  const general = result
    .map((node) => {
      return {
        name: node.name,
        count: counts[node.name]
      }
    })

  const nonFollowedByRoot = general
    .filter((node) => firstLevelScreenNames.indexOf(node.name) === -1)

  console.log(_.sortBy(general, 'count').reverse())
  console.log(_.sortBy(nonFollowedByRoot, 'count').reverse())
}).catch((err) => {
  console.log(err)
  throw err
})
