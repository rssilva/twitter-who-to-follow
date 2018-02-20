const { describe, it, expect } = require('./setup')
const { getTerms } = require('../description-analysis-helper')

describe('description analysis helper', () => {
  describe('getTerms', () => {
    it('should extract terms correctly', () => {
      const description = 'a designer, engineer, creator of: @something_cool'
      const terms = getTerms(description)

      expect(terms).to.eql(['designer', 'engineer', 'creator', '@something_cool'])
    })
  })
})
