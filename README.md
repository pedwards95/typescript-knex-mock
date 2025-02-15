# typescript-mock-knex
This is a very simple project that is designed to be an easy way to mock out your Knex dependency. The basic flow is:
1. Make main MockKnex object
2. Determine expected flow
3. Make mock db to pass into your real code
4. Pass in.. done!

While this mock does support raw queries, the main goal is to flatten and streamline the ORM portion of Knex. All you need to do is put the input chain you expect with the inputs you expect. Call `.RESOLVE()` to signal the end of a query and determine the output.

### Notes:
- Empty inputs accept anything in the real code.
	- Ex: `.select()` will "succeed" when checking `.select("id, name")`
- There is only 1 config option, and that is `printData`. If set to true, it will print out everything that the mock encounters while running through your real code. Useful for when you are not exactly sure what the input data looks like. ;)
- `raw` is currently the only function that can be called right away. All other require a `()` or `("tableName")`. See examples if you are confused.

## version
**"knex": "^3.1.0"**

## Example Code:
```
// overall mock
const DB = new MockKnex();
//or
const DB = new MockKnex({printData:true});

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
	console.log(res); // { test: "passed" }
})(mockDB);
```
or
```
const DB = new MockKnex({ printData: false });

DB.EXPECT()
	.raw("select * from users")
	.RESOLVE({ rows: [{ user: "john" }, { user: "jane" }] });
  
const mockDB = DB.MockDB() as unknown as Knex;

async function myFunc(db: Knex) {
	const query = db.raw("select * from users");
	const res = await query;
	console.log(res.rows[0]); //{ user:"john" }
}

myFunc(mockDB3);
```
Ok ok I admit having to put your own rows result on it is not the best, but better than nothing, right?