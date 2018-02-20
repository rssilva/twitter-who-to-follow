const SIGNS_PATTERN = /(, |\. |: )/g
const TERMS_TO_REMOVE = ['of', 'a', 'and', 'at', '&', 'to', 'for', 'i', 'in', '|', 'on', 'with', 'my', 'are', '_', '•', 'is', '-', 'by', 'you', 'or', 'an', 'the']

const getTerms = (description) => {
  const noSign = description.replace(SIGNS_PATTERN, ' ')
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

module.exports = {
  getTerms,
  countTerms
}
