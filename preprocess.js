const pgp = require("pg-promise")({})
// depending on env variables, change the db info below
const PG_USER = process.env.POSTGRES_USER
const PG_PASSWORD = process.env.POSTGRES_PASSWORD
const PG_DB = process.env.POSTGRES_DB
const db = pgp("postgres://" + 
                PG_USER + 
                ":" + PG_PASSWORD +
                "@localhost/" + PG_DB)
const fs = require('fs')

async function preprocess() {
    let tables = []

    let res = await db.any("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'")
    res.forEach((table) => tables.push(table.tablename))

    tables.forEach(async (table) => {
        try {
            res = await db.any("SELECT * FROM " + table)
            // TODO: hacky, should have option for if pkey is not a string
            // organize data by primary key
            res.sort((a, b) => (a.id > b.id) - (a.id < b.id))
            fs.writeFileSync(process.env.POSTGRES_DB, JSON.stringify(res))
            console.log("Write complete for DB " + process.env.POSTGRES_DB)
        } catch (err) {

        } finally {
            db.$pool.end()
        }
    })
}

preprocess()
module.exports = preprocess
