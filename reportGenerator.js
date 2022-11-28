const { readFileSync, appendFileSync, unlinkSync } = require("fs")
const path = require("path")
const _ = require("lodash")

// "old" and "new" filenames are from process.env.POSTGRES_DB for the pre and post-migration containers, respectively
const OLD_RECORDS_PATH = path.resolve(__dirname, "old")
const NEW_RECORDS_PATH = path.resolve(__dirname, "new")
const REPORT_PATH = path.resolve(__dirname, "report.txt")

const ChangeType = {
  Modified: "Modified",
  Removed: "Removed",
  Added: "Added",
}

try {
  unlinkSync(REPORT_PATH);
  console.log("Deleted report file successfully.")
} catch (err) {
  // ignore errors here, catch just in case so program does not crash
}

/* 
 * Helper function that uses the preprocessed records 
 * that we obtained from preprocess.js.
 * These records are read and promptly put back into an array of 
 * JSON objects to facilitate comparisons of old vs new records
 */
function readRecords(oldRecordsPath, newRecordsPath) {
  try {
    oldRecords = JSON.parse(readFileSync(oldRecordsPath, "utf8"))
    newRecords = JSON.parse(readFileSync(newRecordsPath, "utf8"))
    return [oldRecords, newRecords]
  } catch (err) {
    console.error("Records file for old or new DB not found", err)
  }
}

/* 
 * Helper function to append modified, removed, and/or 
 * added records to the report file
 */
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

/* 
 * Generates a report of modified, removed, or added records.
 * Calls readRecords() to obtain two arrays of JSON object records.
 * These records can then be compared directly to each other by
 * primary key id to identify whether any corruption in data has occurred
 */
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
