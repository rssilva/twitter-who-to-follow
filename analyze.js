const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')
const { getLevels, getCounts, filterUsers, validateCounts, parseData } = require('./analysis-utils')

const PATH = 'data-bkp/'

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
  console.log(countRanking)
  // console.log(_.groupBy(countRanking, 'location'))
  // console.log(_.sortBy(scoreList, 'score').reverse().slice(0, 50))
}).catch((err) => {
  console.log(err)
  throw err
})
