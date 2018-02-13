const { describe, it, expect } = require('./setup')
const analysisUtils = require('../analysis-utils')

describe('analysis utils', () => {
  it('who', () => {
    expect(1).to.be.equal(1)
    analysisUtils.getLevels('paul', 'test/fixtures/')
      .then((levels) => {
        console.log(levels[1])
      })
  })
})
