const fileUtils = require('./file-utils')
const _ = require('lodash')

const locationAnalysis = (levels, general, score) => {
  const firstLevelUsers = _.flatMap(levels[0])
  const firstLevelScreenNames = firstLevelUsers.map((user) => user.screen_name)
  const nonFollowedByRoot = general
    .filter((node) => firstLevelScreenNames.indexOf(node.screenName) === -1)

  const byLocation = _.groupBy(nonFollowedByRoot, 'location')
  const locations = Object.keys(byLocation)

  const locationScore = locations.map((location) => {
    const usersByLocation = byLocation[location].map((user) => {
      user.score = score[user.screenName]
      return user
    })

    let locationScore = score[usersByLocation[0].screenName]
    let locationCount = usersByLocation[0].count

    if (usersByLocation.length > 1) {
      locationScore = usersByLocation.reduce((a, b) => {
        return (score[a.screenName] || 0) + (score[b.screenName] || 0)
      })

      locationCount = usersByLocation.reduce((a, b) => {
        return (a.count || 0) + (b.count || 0)
      })
    }

    return {
      location,
      score: locationScore,
      count: locationCount,
      userQuantity: usersByLocation.length
    }
  })

  fileUtils.writeFile('results/users-by-location.json', JSON.stringify(byLocation))
  fileUtils.writeFile('results/location-score.json', JSON.stringify(_.sortBy(locationScore, 'score').reverse()))
  fileUtils.writeFile('results/location-count.json', JSON.stringify(_.sortBy(locationScore, 'count').reverse()))
  fileUtils.writeFile('results/location-user-quantity.json', JSON.stringify(_.sortBy(locationScore, 'userQuantity').reverse()))
}

module.exports = {
  locationAnalysis
}
