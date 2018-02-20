const rootUser = process.argv[2]
const fileUtils = require('./file-utils')
const _ = require('lodash')
const {
  getLevels,
  getCounts,
  filterUsers,
  validateCounts,
  parseData,
  calculateScore
} = require('./analysis-utils')
// const { countTerms } = require('./description-analysis-helper')

const PATH = 'fixed/'

getLevels(rootUser, PATH).then((levels) => {
  const firstLevelUsers = _.flatMap(levels[0])
  console.log(levels.length, levels[0].length)
  validateCounts(levels)

  const counts = getCounts(levels)

  fileUtils.writeFile('counts.json', JSON.stringify(counts))

  const filtered = filterUsers(counts, 20)
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const result = parseData(levels, filtered)

  fileUtils.writeFile('result.json', JSON.stringify(result))

  // const general = result
  //   .map((node) => {
  //     return {
  //       name: node.name,
  //       count: counts[node.name],
  //       location: node.location,
  //       listedCount: node.listedCount,
  //       description: node.description
  //     }
  //   })

  // const nonFollowedByRoot = general
  //   .filter((node) => firstLevelScreenNames.indexOf(node.name) === -1)

  const score = calculateScore(levels, counts)
  const scoreList = Object.keys(score).map((screenName) => {
    return {
      screenName,
      score: score[screenName]
    }
  })
    .filter((node) => firstLevelScreenNames.indexOf(node.screenName) === -1)

  // console.log(_.sortBy(general, 'count').reverse())
  // const descriptions = _.sortBy(nonFollowedByRoot, 'count').reverse().map((user) => user.description)
  // const termCounts = countTerms(descriptions)
  // console.log(_.sortBy(termCounts, 'count').reverse())
  // fileUtils.writeFile('term-counts.json', JSON.stringify(termCounts))
  // const countRanking = _.sortBy(nonFollowedByRoot, 'count').reverse()
  // console.log(countRanking)
  // const listedRanking = _.sortBy(nonFollowedByRoot, 'listedCount').reverse()
  // console.log(listedRanking)
  // console.log(_.groupBy(countRanking, 'location'))
  console.log(_.sortBy(scoreList, 'score').reverse().slice(0, 50))
}).catch((err) => {
  console.log(err)
  throw err
})
