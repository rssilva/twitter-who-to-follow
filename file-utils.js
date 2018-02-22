const fs = require('fs')

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        return reject(err)
      }

      resolve(data)
    })
  })
}

const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

const stat = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if (err) {
        return reject(err)
      }

      if (err == null) {
        resolve(stat)
      }
    })
  })
}

module.exports = {
  readFile,
  writeFile,
  stat
}
