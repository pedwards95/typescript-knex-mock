import {MockKnex} from "./mockKnex"
import { Knex } from "knex";

// overall mock
const DB = new MockKnex();

// before test
DB.EXPECT()("myTable")
    .select(["objectName", "id"])
    .where("field", "data")
    .RESOLVE({ test: "passed" });

// make mock db instance to pass into real function
const mockDB = DB.MockDB() as unknown as Knex;

// real function runs
(async (db) => {
    const query = db("myTable")
        .select(["objectName", "id"])
        .where("field", "data");
    const res = await query;
    console.log(res);
})(mockDB);

// overall mock
const DB2 = new MockKnex({ printData: true });

// before test
DB2.EXPECT()("myTable")
    .select(["objectName", "id"])
    .where("field", "data")
    .RESOLVE({ test: "passed" });

// make mock db instance to pass into real function
const mockDB2 = DB2.MockDB() as unknown as Knex;

// real function runs
(async (db) => {
    const query = db("myTable")
        .select(["objectName", "id"])
        .where("field", "data");
    const res = await query;
    console.log(res);
})(mockDB2);

const DB3 = new MockKnex({ printData: false });

DB3.EXPECT()
    .raw("select * from users")
    .RESOLVE({ rows: [{ user: "john" }, { user: "jane" }] });

const mockDB3 = DB3.MockDB() as unknown as Knex;

async function myFunc(db: Knex) {
    const query = db.raw("select * from users");
    const res = await query;
    console.log(res.rows[0]); // { user:"john" }
}

myFunc(mockDB3);