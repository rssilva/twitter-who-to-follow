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
const { descriptionAnalysis } = require('./description-analysis-helper')
const { locationAnalysis } = require('./location-analysis-helper')
const config = require('./config')

const PATH = process.argv[3] || 'data/'
const { APPEARENCES_COUNT_MIN_LIMIT } = config

getLevels(rootUser, PATH).then((levels) => {
  const firstLevelUsers = _.flatMap(levels[0])

  // This will check the difference between user following counts fetched from the rootUser
  //  to the ones fetched on the first level
  // validateCounts(levels)

  const counts = getCounts(levels)

  const filtered = filterUsers(counts, APPEARENCES_COUNT_MIN_LIMIT)
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
  fileUtils.writeFile('results/users-by-count.json', JSON.stringify(_.sortBy(general, 'count').reverse()))
  fileUtils.writeFile('results/users-by-score.json', JSON.stringify(_.sortBy(scoreList, 'count').reverse()))

  // Location analysis
  locationAnalysis(levels, general, score)

  // Description/bio words analysis
  descriptionAnalysis(general, nonFollowedByRoot)
}).catch((err) => {
  console.log(err)
  throw err
})
