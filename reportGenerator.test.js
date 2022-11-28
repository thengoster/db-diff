const { readRecords, reportGenerator } = require("./reportGenerator")
const { readFileSync, appendFileSync } = require("fs")
const _ = require("lodash")
const path = require("path")

var MOCK_OLD_RECORDS_PATH = path.resolve(__dirname, "oldTest")
var MOCK_NEW_RECORDS_PATH = path.resolve(__dirname, "newTest")

const ChangeType = {
  Modified: "Modified",
  Removed: "Removed",
  Added: "Added",
}

var MOCK_REPORT_PATH = path.resolve(__dirname, "report.txt")
var MOCK_REPORT_TEST_PATH = path.resolve(__dirname, "reportTest.txt")

var report = ""

jest.mock("fs", () => ({
    readFileSync: jest.fn((filePath) => {
        if (filePath === MOCK_OLD_RECORDS_PATH) {
          return `[{"id":"0","name":"Denny","email":"Denny@mail.com"},{"id":"1","name":"Mamba"},{"id":"2","name":"Bobo","email":"Denny@mail.com","nickname":"Bo"},{"id":"a","name":"Dan","email":"Dan@goodmail.net"},{"id":"b","name":"Denny","email":"Denny@mail.com"}]`
        } else if (filePath === MOCK_NEW_RECORDS_PATH) {
          return `[{"id":"0","name":"Denny","email":"Denny@mail.com"},{"id":"1","name":"Mamba","email":"Mamba@mail.com" },{"id":"2","name":"Bobo","email":"Denny@mail.com"},{"id":"a","name":"Dan","email":"Dan@badmail.net"},{"id":"c","name":"Monica","email":"Monica@mail.com"}]`
        } else if (filePath === MOCK_REPORT_TEST_PATH) {
          return `Modified: 1
{"id":"1","name":"Mamba"}
{"id":"1","name":"Mamba","email":"Mamba@mail.com"}
Modified: 2
{"id":"2","name":"Bobo","email":"Denny@mail.com","nickname":"Bo"}
{"id":"2","name":"Bobo","email":"Denny@mail.com"}
Modified: a
{"id":"a","name":"Dan","email":"Dan@goodmail.net"}
{"id":"a","name":"Dan","email":"Dan@badmail.net"}
Removed: b
{"id":"b","name":"Denny","email":"Denny@mail.com"}
Added: c
{"id":"c","name":"Monica","email":"Monica@mail.com"}
`
        } else {
          return `[]`
        }
    }),
    appendFileSync: jest.fn((filePath, appendData) => {
      if (filePath === MOCK_REPORT_PATH) {
        console.log(appendData)
        report += appendData
      }
    })
}))

describe('reportGenerator test cases', () => {
  beforeAll(() => {
    try {
      unlinkSync(REPORT_PATH);
      console.log("Deleted report file successfully.")
    } catch (err) {
      // console.log(err)
    }
  })

  test("should generate report with proper notations for MODIFIED, REMOVED, and ADDED data", async () => {
    await reportGenerator(MOCK_OLD_RECORDS_PATH, MOCK_NEW_RECORDS_PATH, MOCK_REPORT_PATH)
    const MOCK_REPORT = readFileSync(MOCK_REPORT_TEST_PATH, "utf8")
    expect(report).toEqual(MOCK_REPORT)
  })

})
