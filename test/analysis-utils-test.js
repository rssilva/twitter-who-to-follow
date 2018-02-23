const { describe, it, expect } = require('./setup')
const { getLevels, getCounts, calculateScore, filterUsers, validateCounts, parseData } = require('../analysis-utils')
const scoreData = require('./fixtures/calculate-score-fixture')
const validateCountsData = require('./fixtures/validate-counts-fixture')
const parseDataData = require('./fixtures/parse-data-fixture')

describe('analysis utils', () => {
  describe('getLevels', () => {
    it('get levels data', () => {
      return getLevels('paul', 'test/fixtures/')
        .then((levels) => {
          expect(levels).to.have.length(2)
          expect(levels[0]).to.have.length(4)
          expect(levels[1]).to.have.length(4)

          expect(levels[0]).to.eql([
            [ { id: 1, screen_name: 'ringo' } ],
            [ { id: 2, screen_name: 'george' } ],
            [ { id: 3, screen_name: 'john' } ],
            [ { id: 5, screen_name: 'michaelJackson' } ]
          ])

          const followedByRingo = levels[1][0].map((user) => user.screen_name)
          const followedByGeorge = levels[1][1].map((user) => user.screen_name)
          const followedByMichael = levels[1][3].map((user) => user.screen_name)

          expect(followedByRingo).to.eql(['paul', 'george', 'john'])
          expect(followedByGeorge).to.eql(['paul', 'john', 'ringo'])
          expect(followedByMichael).to.eql(['paul', 'janetJackson'])
        })
    })
  })

  describe('calculateScore', () => {
    it('returns the score by screen_name', () => {
      const counts = getCounts(scoreData.levels)
      const score = calculateScore(scoreData.levels, counts)

      expect(score).to.eql({
        frodo: 5,
        elrond: 4,
        radagast: 3,
        gandalf: 2,
        merry: 1
      })
    })
  })

  describe('filterUsers', () => {
    it('gets only users with counts above a specific value', () => {
      const counts1 = getCounts(scoreData.levels, 2)
      const counts2 = getCounts(scoreData.levels, 1)

      expect(filterUsers(counts1, 2)).to.eql(['gandalf', 'frodo'])
      expect(filterUsers(counts2, 1)).to.eql(['gandalf', 'elrond', 'frodo'])
    })
  })

  describe('validateCounts', () => {
    it('returns a list with users that has a difference between friends_count and the ones fetched by the api', () => {
      expect(validateCounts(validateCountsData.levels)).to.eql(['sam'])
    })
  })

  describe('parseData', () => {
    it('parses data to d3 graph format according the passed list', () => {
      const list = ['gandalf', 'arwen', 'elrond', 'frodo', 'galadriel']
      const parsed = parseData(parseDataData.levels, list)

      expect(parsed).to.eql([
        {
          name: 'gandalf',
          size: 0,
          imports: [ 'elrond', 'frodo', 'galadriel' ],
          location: 'here and there'
        },
        {
          name: 'arwen',
          size: 0,
          imports: [ 'elrond', 'gandalf', 'galadriel' ],
          location: 'rivendell'
        },
        { name: 'elrond', size: 0, imports: [], location: undefined },
        { name: 'frodo', size: 0, imports: [], location: undefined },
        { name: 'galadriel', size: 0, imports: [], location: undefined }
      ])
    })
  })
})
