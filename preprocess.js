const pgp = require("pg-promise")({})
// depending on env variables, change the db info below
const PG_USER = process.env.POSTGRES_USER
const PG_PASSWORD = process.env.POSTGRES_PASSWORD
const PG_DB = process.env.POSTGRES_DB
const db = pgp("postgres://" + 
                PG_USER + 
                ":" + PG_PASSWORD +
                "@localhost/" + PG_DB)
const { writeFileSync } = require('fs')

/* 
 * Extracts all records from Postgres DB,
 * sorting the records by their primary key (id).
 * The sort will allow us to operate on the old and new record lists
 * similarly to linked lists, where we can walk the list forward
 * and compare primary keys for the report generator
 */
async function preprocess() {
    let tables = []

    // use pg_catalog.pg_tables to find the tablenames of the DB
    let res = await db.any("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'")
    res.forEach((table) => tables.push(table.tablename))

    tables.forEach(async (table) => {
        try {
            res = await db.any("SELECT * FROM " + table)
            // sort data by primary key id, which is a string
            res.sort((a, b) => (a.id > b.id) - (a.id < b.id))
            writeFileSync(process.env.POSTGRES_DB, JSON.stringify(res))
            console.log("Write complete for DB " + process.env.POSTGRES_DB)
        } catch (err) {
            console.error("Error occurred during query + write of DB", err)
        } finally {
            db.$pool.end()
        }
    })
}

preprocess()
module.exports = preprocess
