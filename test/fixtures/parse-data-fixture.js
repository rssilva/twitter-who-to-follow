module.exports = {
  levels: [
    // first level
    [
      [ { id: 1, screen_name: 'gandalf', location: 'here and there' } ],
      [ { id: 2, screen_name: 'arwen', location: 'rivendell' } ],
      [ { id: 3, screen_name: 'aragorn', location: 'gondor' } ]
    ],
    // second level
    [
      // followed by gandalf
      [
        { id: 4, screen_name: 'radagast' },
        { id: 5, screen_name: 'elrond' },
        { id: 6, screen_name: 'frodo' },
        { id: 7, screen_name: 'galadriel' }
      ],
      // followed by arwen
      [
        { id: 5, screen_name: 'elrond' },
        { id: 3, screen_name: 'aragorn' },
        { id: 3, screen_name: 'gandalf' },
        { id: 7, screen_name: 'galadriel' }
      ],
      // followed by aragorn
      [
        { id: 5, screen_name: 'elrond' },
        { id: 1, screen_name: 'gandalf' },
        { id: 6, screen_name: 'frodo' }
      ]
    ]
  ]
}
