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
// const { locationAnalysis } = require('./location-analysis-helper')

const PATH = 'fixed/'

getLevels(rootUser, PATH).then((levels) => {
  const firstLevelUsers = _.flatMap(levels[0])
  // validateCounts(levels)

  const counts = getCounts(levels)

  const filtered = filterUsers(counts, 70)
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const parsedLevels = parseData(levels, filtered)
  const score = calculateScore(levels, counts)

  fileUtils.writeFile('results/parsed-levels.json', JSON.stringify(parsedLevels))

  const general = parsedLevels
    .map((node) => {
      return {
        screenName: node.name,
        count: counts[node.name],
        location: node.location.replace(/,.*/g, '').toLowerCase(),
        listedCount: node.listedCount,
        description: node.description
      }
    })

  // locationAnalysis(levels, general, score)

  const nonFollowedByRoot = general
    .filter((node) => firstLevelScreenNames.indexOf(node.screenName) === -1)

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

  // const usersByCount = _.sortBy(general, 'count').reverse()
  // fileUtils.writeFile('results/users-by-count.json', JSON.stringify(usersByCount))
  // fileUtils.writeFile('results/users-by-score.json', JSON.stringify(scoreList.reverse()))
}).catch((err) => {
  console.log(err)
  throw err
})
