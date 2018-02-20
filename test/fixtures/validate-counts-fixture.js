module.exports = {
  levels: [
    // first level
    [
      [ { id: 1, screen_name: 'gandalf', friends_count: 3 } ],
      [ { id: 2, screen_name: 'sam', friends_count: 20 } ],
      [ { id: 3, screen_name: 'aragorn', friends_count: 3 } ]
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
        { id: 7, screen_name: 'merry' },
        { id: 8, screen_name: 'pippin' },
        { id: 9, screen_name: 'boromir' },
        { id: 10, screen_name: 'legolas' },
        { id: 11, screen_name: 'aragorn' }
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
