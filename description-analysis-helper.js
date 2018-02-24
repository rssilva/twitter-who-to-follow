const _ = require('lodash')
const SIGNS_PATTERN = /(, |\. |: )/g
const TERMS_TO_REMOVE = ['of', 'a', 'and', 'at', '&', 'to', 'for', 'i', 'in', '|', 'on', 'with', 'my', 'are', '_', '•', 'is', '-', 'by', 'you', 'or', 'an', 'the', 'os', 'it']

const getTerms = (description = '') => {
  const noSign = description.replace(SIGNS_PATTERN, ' ').toLowerCase()
  const splitted = noSign.toLowerCase().split(' ')
  const filtered = splitted.filter((term) => {
    return TERMS_TO_REMOVE.indexOf(term) === -1
  })

  return filtered
}

const countTerms = (descriptions) => {
  const counts = {}

  descriptions.forEach((description) => {
    getTerms(description).forEach((term) => {
      if (!counts[term]) {
        counts[term] = 0
      }

      counts[term]++
    })
  })

  const countsArr = Object.keys(counts).map((term) => {
    return {
      term,
      count: counts[term]
    }
  })

  return countsArr
}

const groupUsersByTerm = (terms, users) => {
  const grouped = {}

  users.forEach((user) => {
    const userTerms = getTerms(user.description)

    userTerms.forEach((term) => {
      if (terms.indexOf(term) !== -1) {
        if (!grouped[term]) {
          grouped[term] = []
        }

        const userWasAlreadyAdded = _.find(grouped[term], {screenName: user.screenName})

        if (!userWasAlreadyAdded) {
          grouped[term].push(user)
        }
      }
    })
  })

  Object.keys(grouped).forEach((term) => {
    grouped[term] = _.sortBy(grouped[term], 'count').reverse()
  })

  return grouped
}

module.exports = {
  getTerms,
  countTerms,
  groupUsersByTerm
}
