const { readFileSync, appendFileSync, unlinkSync } = require("fs")
const path = require("path")
const _ = require("lodash")

const OLD_RECORDS_PATH = path.resolve(__dirname, "oldTest")
const NEW_RECORDS_PATH = path.resolve(__dirname, "newTest")

const ChangeType = {
  Modified: "Modified",
  Removed: "Removed",
  Added: "Added",
}

const REPORT_PATH = path.resolve(__dirname, "report.txt")

try {
  unlinkSync(REPORT_PATH);
  console.log("Deleted report file successfully.")
} catch (err) {
  // console.log(err)
}

function readRecords(oldRecordsPath, newRecordsPath) {
  try {
    oldRecords = JSON.parse(readFileSync(oldRecordsPath, "utf8"))
    newRecords = JSON.parse(readFileSync(newRecordsPath, "utf8"))
    return [oldRecords, newRecords]
  } catch (err) {
    console.error("Records file for old or new db not found", err)
  }
}

async function appendToReport(reportPath, oldRecord, newRecord, changeType) {
  switch (changeType) {
    case ChangeType.Modified:
      appendFileSync(reportPath, ChangeType.Modified + ": " + oldRecord.id + "\n")
      appendFileSync(reportPath, JSON.stringify(oldRecord) + "\n")
      appendFileSync(reportPath, JSON.stringify(newRecord) + "\n")
      break
    case ChangeType.Removed:
      appendFileSync(reportPath, ChangeType.Removed + ": " + oldRecord.id + "\n")
      appendFileSync(reportPath, JSON.stringify(oldRecord) + "\n")
      break
    case ChangeType.Added:
      appendFileSync(reportPath, ChangeType.Added + ": " + newRecord.id + "\n")
      appendFileSync(reportPath, JSON.stringify(newRecord) + "\n")
      break
    default:
      console.error("changeType needs to be one of: Modified, Removed, Added")
  }
}

async function reportGenerator(oldRecordsPath, newRecordsPath, reportPath) {
  let i = 0, j = 0

  const [oldRecords, newRecords] = readRecords(oldRecordsPath, newRecordsPath)
  while (i < oldRecords.length && j < newRecords.length) {
    if (oldRecords[i].id === newRecords[j].id) {
      // start with simple dump of the contents if the two records are not the same
      if (!_.isEqual(oldRecords[i], newRecords[j])) {
        await appendToReport(reportPath, oldRecords[i], newRecords[j], ChangeType.Modified)
      }
      ++i, ++j
    } else if (oldRecords[i].id < newRecords[j].id) {
      // new db missing an oldRecord record
      await appendToReport(reportPath, oldRecords[i], newRecords[j], ChangeType.Removed)
      ++i
    } else {
      // new db has a new record that was not in the old db
      await appendToReport(reportPath, oldRecords[i], newRecords[j], ChangeType.Added)
      ++j
    }
  }

  if (i < oldRecords.length) {
    // old records that did not make it
    await appendToReport(reportPath, oldRecords[i], newRecords[j], ChangeType.Removed)
    ++i
  }

  if (j < newRecords.length) {
    // all new records
    await appendToReport(reportPath, oldRecords[i], newRecords[j], ChangeType.Added)
    ++j
  }
}

reportGenerator(OLD_RECORDS_PATH, NEW_RECORDS_PATH, REPORT_PATH)

module.exports = { readRecords, reportGenerator }
