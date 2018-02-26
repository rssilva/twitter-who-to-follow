# Who To Follow

Did this to find new people on my twitter network to follow
I wrote an [article](https://medium.com/@rssilva/rethinking-twitters-who-to-follow-using-node-js-and-d3-js-d8875d112bc8) about the method.

You'll need consumer **key** and **secret** to run the scripts. There are a [tutorial](https://developer.twitter.com/en/docs/basics/getting-started) to get started.

## Running

You need to create a `config.js` file with the same variables that are on `config-sample.js`. There you'll need to input your keys.

To get all users that a specific user is following you can run

`node get-first-level rafael_sps` (replace your twitter username here)

Then

`node get-second-level rafael_sps` (replace the same twitter username here)

### Installing

`npm install`

### Running the tests

`npm test`

### Running the code coverage

`npm run coverage`
