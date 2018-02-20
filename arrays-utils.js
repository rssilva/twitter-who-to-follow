const removeDupes = (arr, prop) => {
  const unique = []
  const alreadyAdded = {}

  arr.forEach((item) => {
    if (!alreadyAdded[item[prop]]) {
      unique.push(item)

      alreadyAdded[item[prop]] = true
    }
  })

  return unique
}

module.exports = {
  removeDupes
}
