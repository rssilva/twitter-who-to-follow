const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')
const { getLevels, getCounts, calculateScore } = require('./analysis-utils')
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
            imports,
            location: levelUser.location
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

getLevels(rootUser, PATH).then((levels) => {
  const firstLevelUsers = _.flatMap(levels[0])

  validateCounts(levels)

  const counts = getCounts(levels)

  fileUtils.writeFile('counts.json', JSON.stringify(counts))

  const filtered = filterUsers(counts, 20)
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const result = parseData(levels, filtered)

  fileUtils.writeFile('result.json', JSON.stringify(result))

  const general = result
    .map((node) => {
      return {
        name: node.name,
        count: counts[node.name],
        location: node.location
      }
    })

  const nonFollowedByRoot = general
    .filter((node) => firstLevelScreenNames.indexOf(node.name) === -1)

  // const score = calculateScore(levels, counts)
  // const scoreList = Object.keys(score).map((screenName) => {
  //   return {
  //     screenName,
  //     score: score[screenName]
  //   }
  // })
  // .filter((node) => firstLevelScreenNames.indexOf(node.screenName) === -1)

  // console.log(_.sortBy(general, 'count').reverse())
  const countRanking = _.sortBy(nonFollowedByRoot, 'count').reverse()
  // console.log(countRanking)
  console.log(_.groupBy(countRanking, 'location'))
  // console.log(_.sortBy(scoreList, 'score').reverse().slice(0, 50))
}).catch((err) => {
  console.log(err)
  throw err
})
