module.exports = {
  levels: [
    // first level
    [
      [ { id: 1, screen_name: 'gandalf' } ],
      [ { id: 2, screen_name: 'sam' } ],
      [ { id: 3, screen_name: 'aragorn' } ]
    ],
    // second level
    [
      // followed by gandalf
      [
        { id: 4, screen_name: 'radagast' },
        { id: 5, screen_name: 'elrond' },
        { id: 6, screen_name: 'frodo' }
      ],
      // followed by sam
      [
        { id: 6, screen_name: 'frodo' },
        { id: 1, screen_name: 'gandalf' },
        { id: 7, screen_name: 'merry' }
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
