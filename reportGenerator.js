const fs = require('fs')
const _ = require('lodash')

const OLD_DATA_PATH = "old"
const NEW_DATA_PATH = "new"

const ChangeType = {
  Modified: "Modified",
  Removed: "Removed",
  Added: "Added",
}

const REPORT_PATH = "report.txt"

try {
  fs.unlinkSync(REPORT_PATH);
  console.log("Deleted report file successfully.")
} catch (err) {
  // console.log(err)
}

let oldData = [], newData = []

try {
  oldData = JSON.parse(fs.readFileSync(OLD_DATA_PATH, "utf8"))
  newData = JSON.parse(fs.readFileSync(NEW_DATA_PATH, "utf8"))
} catch (err) {
  console.error("Data file for old or new db not found", err)
}

async function appendToReport(oldData, newData, changeType) {
  switch (changeType) {
    case ChangeType.Modified:
      fs.appendFileSync(REPORT_PATH, ChangeType.Modified + ": " + oldData.id + "\n")
      fs.appendFileSync(REPORT_PATH, JSON.stringify(oldData) + "\n")
      fs.appendFileSync(REPORT_PATH, JSON.stringify(newData) + "\n")
      break
    case ChangeType.Removed:
      fs.appendFileSync(REPORT_PATH, ChangeType.Removed + ": " + oldData.id + "\n")
      fs.appendFileSync(REPORT_PATH, JSON.stringify(oldData) + "\n")
      break
    case ChangeType.Added:
      fs.appendFileSync(REPORT_PATH, ChangeType.Added + ": " + newData.id + "\n")
      fs.appendFileSync(REPORT_PATH, JSON.stringify(newData) + "\n")
      break
    default:
      console.error("changeType needs to be one of: Modified, Removed, Added")
  }
}

async function reportGenerator () {
  let i = 0, j = 0
  while (i < oldData.length && j < newData.length) {
    if (oldData[i].id === newData[j].id) {
      // start with simple dump of the contents if the two records are not the same
      if (!_.isEqual(oldData[i], newData[j])) {
        await appendToReport(oldData[i], newData[j], ChangeType.Modified)
      }
      ++i, ++j
    } else if (oldData[i].id < newData[j].id) {
      // new db missing an oldData record
      await appendToReport(oldData[i], newData[j], ChangeType.Removed)
      ++i
    } else {
      // new db has a new record that was not in the old db
      await appendToReport(oldData[i], newData[j], ChangeType.Added)
      ++j
    }
  }

  if (i < oldData.length) {
    // old records that did not make it
    await appendToReport(oldData[i], newData[j], ChangeType.Removed)
    ++i
  }

  if (j < newData.length) {
    // all new records
    await appendToReport(oldData[i], newData[j], ChangeType.Added)
    ++j
  }
}

reportGenerator()

module.exports = { reportGenerator }
