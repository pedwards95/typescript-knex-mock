"use strict";

import _ from "lodash";

/**
 * MockKnex mocking package and object for a Knex DB
 *
 * Sample usage:
 * ```
 * // overall mock
 * const DB = new MockKnex();
 * //or
 * const DB = new MockKnex({printData:true});
 *
 * // before test
 * DB.EXPECT()("myTable")
 *     .select(["objectName", "id"])
 *     .where("field", "data")
 *     .RESOLVE({ test: "passed" });
 *
 * // make mock db instance to pass into real function
 * const mockDB = DB.MockDB() as unknown as Knex;
 *
 * // real function runs
 * (async (db) => {
 *     const query = db("myTable")
 *         .select(["objectName", "id"])
 *         .where("field", "data");
 *     const res = await query;
 *     console.log(res); // { test: "passed" }
 * })(mockDB);
 *
 * ```
 */
class MockKnex {
	private dataArrayArray: Data[][];
	private config: Config | null;

	constructor(config?: Config) {
		if (config) {
			this.config = config;
		} else {
			this.config = null;
		}
		this.dataArrayArray = new Array<Data[]>();
	}

	/**
	 * Call EXPECT to craft the expected mock values. EXPECT and then make the chain you expect.
	 * If no variables are passed in to the chain, it will accept any variables.
	 *
	 * Example: ```EXPECT()(string? "optional table name")```
	 *
	 * Call RESOLVE to pass in the object you are supposed to get at the very end.
	 */
	public EXPECT() {
		const mQFunc = (tableName?: string) => {
			const newData = new Array<Data>();
			this.dataArrayArray.push(newData);
			return new MockQuery(newData, tableName);
		};
		mQFunc.raw = (input: any) => {
			const newData = new Array<Data>();
			this.dataArrayArray.push(newData);
			const inputString = `raw:${input}`;
			return new MockQuery(newData, inputString);
		};
		return mQFunc;
	}

	/**
	 * MockDB use for mock passed into function you are testing.
	 * Call EXPECT first to craft the expected mock values.
	 */
	public MockDB() {
		const mRFunc = (tableName?: string) => {
			return new MockResolve(this.config, this.dataArrayArray, tableName);
		};
		mRFunc.raw = (input: any) => {
			const inputString = `raw:${input}`;
			return new MockResolve(
				this.config,
				this.dataArrayArray,
				inputString
			);
		};
		return mRFunc;
	}
}

//ensure implementation
interface MockPath {
	column();
	columns();
	comment();
	hintComment();
	from();
	fromRaw();
	into();
	table();
	join();
	joinRaw();
	innerJoin();
	leftJoin();
	leftOuterJoin();
	rightJoin();
	rightOuterJoin();
	outerJoin();
	fullOuterJoin();
	crossJoin();
	using();
	select();
	distinct();
	distinctOn();
	jsonExtract();
	jsonInsert();
	jsonRemove();
	jsonSet();
	as();
	where();
	andWhere();
	orWhere();
	whereNot();
	andWhereNot();
	orWhereNot();
	whereIn();
	whereNotIn();
	orWhereIn();
	orWhereNotIn();
	whereNull();
	whereNotNull();
	orWhereNotNull();
	whereRaw();
	andWhereRaw();
	orWhereRaw();
	whereWrapped();
	havingWrapped();
	whereJsonObject();
	orWhereJsonObject();
	andWhereJsonObject();
	whereNotJsonObject();
	orWhereNotJsonObject();
	andWhereNotJsonObject();
	whereJsonPath();
	orWhereJsonPath();
	andWhereJsonPath();
	whereJsonSupersetOf();
	orWhereJsonSupersetOf();
	andWhereJsonSupersetOf();
	whereJsonNotSupersetOf();
	orWhereJsonNotSupersetOf();
	andWhereJsonNotSupersetOf();
	whereJsonSubsetOf();
	orWhereJsonSubsetOf();
	andWhereJsonSubsetOf();
	whereJsonNotSubsetOf();
	orWhereJsonNotSubsetOf();
	andWhereJsonNotSubsetOf();
	whereLike();
	andWhereLike();
	orWhereLike();
	whereILike();
	andWhereILike();
	orWhereILike();
	whereBetween();
	andWhereBetween();
	orWhereBetween();
	whereNotBetween();
	andWhereNotBetween();
	orWhereNotBetween();
	whereExists();
	orWhereExists();
	whereNotExists();
	orWhereNotExists();
	groupBy();
	groupByRaw();
	orderBy();
	orderByRaw();
	partitionBy();
	union();
	unionAll();
	intersect();
	except();
	having();
	andHaving();
	orHaving();
	havingRaw();
	orHavingRaw();
	havingIn();
	havingNotIn();
	andHavingNotIn();
	orHavingNotIn();
	havingBetween();
	orHavingBetween();
	havingNotBetween();
	orHavingNotBetween();
	havingNull();
	havingNotNull();
	clearSelect();
	clearWhere();
	clearGroup();
	clearOrder();
	clearHaving();
	clearCounters();
	clear();
	offset();
	limit();
	count();
	countDistinct();
	min();
	max();
	sumDistinct();
	avg();
	avgDistinct();
	insert();
	upsert();
	update();
	updateFrom();
	modify();
	returning();
	onConflict();
	increment();
	decrement();
	del();
	delete();
	truncate();
	rank();
	denseRank();
	rowNumber();
	first();
	pluck();
	with();
	withMaterialized();
	withNotMaterialized();
	withRaw();
	withRecursive();
	withSchema();
	withWrapped();
	raw();
	rows();
	query();
}

/**
 * Data class
 * @property {string} action
 * @property {any} parameters
 * @property {boolean} isMore
 * @property {any} result?
 */
class Data {
	action: string;
	parameters: any;
	isMore: boolean;
	result?: any;
}

//const
const COLUMN = "column",
	COLUMNS = "columns",
	COMMENT = "comment",
	HINTCOMMENT = "hintcomment",
	FROM = "from",
	FROMRAW = "fromraw",
	INTO = "into",
	TABLE = "table",
	JOIN = "join",
	JOINRAW = "joinraw",
	INNERJOIN = "innerjoin",
	LEFTJOIN = "leftjoin",
	LEFTOUTERJOIN = "leftouterjoin",
	RIGHTJOIN = "rightjoin",
	RIGHTOUTERJOIN = "rightouterjoin",
	OUTERJOIN = "outerjoin",
	FULLOUTERJOIN = "fullouterjoin",
	CROSSJOIN = "crossjoin",
	USING = "using",
	SELECT = "select",
	DISTINCT = "distinct",
	DISTINCTON = "distincton",
	JSONEXTRACT = "jsonextract",
	JSONINSERT = "jsoninsert",
	JSONREMOVE = "jsonremove",
	JSONSET = "jsonset",
	AS = "as",
	WHERE = "where",
	ANDWHERE = "andwhere",
	ORWHERE = "orwhere",
	WHERENOT = "wherenot",
	ANDWHERENOT = "andwherenot",
	ORWHERENOT = "orwherenot",
	WHEREIN = "wherein",
	WHERENOTIN = "wherenotin",
	ORWHEREIN = "orwherein",
	ORWHERENOTIN = "orwherenotin",
	WHERENULL = "wherenull",
	WHERENOTNULL = "wherenotnull",
	ORWHERENOTNULL = "orwherenotnull",
	WHERERAW = "whereraw",
	ANDWHERERAW = "andwhereraw",
	ORWHERERAW = "orwhereraw",
	WHEREWRAPPED = "wherewrapped",
	HAVINGWRAPPED = "havingwrapped",
	WHEREJSONOBJECT = "wherejsonobject",
	ORWHEREJSONOBJECT = "orwherejsonobject",
	ANDWHEREJSONOBJECT = "andwherejsonobject",
	WHERENOTJSONOBJECT = "wherenotjsonobject",
	ORWHERENOTJSONOBJECT = "orwherenotjsonobject",
	ANDWHERENOTJSONOBJECT = "andwherenotjsonobject",
	WHEREJSONPATH = "wherejsonpath",
	ORWHEREJSONPATH = "orwherejsonpath",
	ANDWHEREJSONPATH = "andwherejsonpath",
	WHEREJSONSUPERSETOF = "wherejsonsupersetof",
	ORWHEREJSONSUPERSETOF = "orwherejsonsupersetof",
	ANDWHEREJSONSUPERSETOF = "andwherejsonsupersetof",
	WHEREJSONNOTSUPERSETOF = "wherejsonnotsupersetof",
	ORWHEREJSONNOTSUPERSETOF = "orwherejsonnotsupersetof",
	ANDWHEREJSONNOTSUPERSETOF = "andwherejsonnotsupersetof",
	WHEREJSONSUBSETOF = "wherejsonsubsetof",
	ORWHEREJSONSUBSETOF = "orwherejsonsubsetof",
	ANDWHEREJSONSUBSETOF = "andwherejsonsubsetof",
	WHEREJSONNOTSUBSETOF = "wherejsonnotsubsetof",
	ORWHEREJSONNOTSUBSETOF = "orwherejsonnotsubsetof",
	ANDWHEREJSONNOTSUBSETOF = "andwherejsonnotsubsetof",
	WHERELIKE = "wherelike",
	ANDWHERELIKE = "andwherelike",
	ORWHERELIKE = "orwherelike",
	WHEREILIKE = "whereilike",
	ANDWHEREILIKE = "andwhereilike",
	ORWHEREILIKE = "orwhereilike",
	WHEREBETWEEN = "wherebetween",
	ANDWHEREBETWEEN = "andwherebetween",
	ORWHEREBETWEEN = "orwherebetween",
	WHERENOTBETWEEN = "wherenotbetween",
	ANDWHERENOTBETWEEN = "andwherenotbetween",
	ORWHERENOTBETWEEN = "orwherenotbetween",
	WHEREEXISTS = "whereexists",
	ORWHEREEXISTS = "orwhereexists",
	WHERENOTEXISTS = "wherenotexists",
	ORWHERENOTEXISTS = "orwherenotexists",
	GROUPBY = "groupby",
	GROUPBYRAW = "groupbyraw",
	ORDERBY = "orderby",
	ORDERBYRAW = "orderbyraw",
	PARTITIONBY = "partitionby",
	UNION = "union",
	UNIONALL = "unionall",
	INTERSECT = "intersect",
	EXCEPT = "except",
	HAVING = "having",
	ANDHAVING = "andhaving",
	ORHAVING = "orhaving",
	HAVINGRAW = "havingraw",
	ORHAVINGRAW = "orhavingraw",
	HAVINGIN = "havingin",
	HAVINGNOTIN = "havingnotin",
	ANDHAVINGNOTIN = "andhavingnotin",
	ORHAVINGNOTIN = "orhavingnotin",
	HAVINGBETWEEN = "havingbetween",
	ORHAVINGBETWEEN = "orhavingbetween",
	HAVINGNOTBETWEEN = "havingnotbetween",
	ORHAVINGNOTBETWEEN = "orhavingnotbetween",
	HAVINGNULL = "havingnull",
	HAVINGNOTNULL = "havingnotnull",
	CLEARSELECT = "clearselect",
	CLEARWHERE = "clearwhere",
	CLEARGROUP = "cleargroup",
	CLEARORDER = "clearorder",
	CLEARHAVING = "clearhaving",
	CLEARCOUNTERS = "clearcounters",
	CLEAR = "clear",
	OFFSET = "offset",
	LIMIT = "limit",
	COUNT = "count",
	COUNTDISTINCT = "countdistinct",
	MIN = "min",
	MAX = "max",
	SUMDISTINCT = "sumdistinct",
	AVG = "avg",
	AVGDISTINCT = "avgdistinct",
	INSERT = "insert",
	UPSERT = "upsert",
	UPDATE = "update",
	UPDATEFROM = "updatefrom",
	MODIFY = "modify",
	RETURNING = "returning",
	ONCONFLICT = "onconflict",
	INCREMENT = "increment",
	DECREMENT = "decrement",
	DEL = "del",
	DELETE = "delete",
	TRUNCATE = "truncate",
	RANK = "rank",
	DENSERANK = "denserank",
	ROWNUMBER = "rownumber",
	FIRST = "first",
	PLUCK = "pluck",
	WITH = "with",
	WITHMATERIALIZED = "withmaterialized",
	WITHNOTMATERIALIZED = "withnotmaterialized",
	WITHRAW = "withraw",
	WITHRECURSIVE = "withrecursive",
	WITHSCHEMA = "withschema",
	WITHWRAPPED = "withwrapped",
	RAW = "raw",
	ROWS = "rows",
	QUERY = "query";

/**
 * MockQuery for building expects
 *
 * Example:
 * ```
 * MockQueryInstance.EXPECT()("myTable")
 *     .select(["objectName", "id"])
 *     .where("field", "data")
 *     .RESOLVE({ test: "passed" });
 * ```
 */
class MockQuery implements MockPath {
	private dataArray: Data[];

	constructor(passedDataArray: Data[], tableName?: string) {
		this.dataArray = passedDataArray;
		if (tableName) {
			let dataToAdd: Data = CraftData(TABLE, tableName, true);
			this.dataArray.push(dataToAdd);
		}
	}

	public column(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(COLUMN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public columns(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(COLUMNS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public comment(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(COMMENT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public hintComment(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HINTCOMMENT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public from(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(FROM, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public fromRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(FROMRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public into(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(INTO, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public table(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(TABLE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public join(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public joinRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JOINRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public innerJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(INNERJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public leftJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(LEFTJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public leftOuterJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(LEFTOUTERJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public rightJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(RIGHTJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public rightOuterJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(RIGHTOUTERJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public outerJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(OUTERJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public fullOuterJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(FULLOUTERJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public crossJoin(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CROSSJOIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public using(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(USING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public select(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(SELECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public distinct(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DISTINCT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public distinctOn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DISTINCTON, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public jsonExtract(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JSONEXTRACT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public jsonInsert(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JSONINSERT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public jsonRemove(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JSONREMOVE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public jsonSet(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(JSONSET, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public as(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(AS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public where(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhere(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhere(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNot(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereNot(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERENOT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNot(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNotIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOTIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNotIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOTIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNull(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENULL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNotNull(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOTNULL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNotNull(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOTNULL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERERAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERERAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERERAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereWrapped(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREWRAPPED, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingWrapped(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGWRAPPED, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNotJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOTJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNotJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOTJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereNotJsonObject(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERENOTJSONOBJECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonPath(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONPATH, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonPath(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONPATH, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonPath(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONPATH, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonNotSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONNOTSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonNotSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONNOTSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonNotSupersetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONNOTSUPERSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereJsonNotSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREJSONNOTSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereJsonNotSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREJSONNOTSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereJsonNotSubsetOf(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREJSONNOTSUBSETOF, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereLike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERELIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereLike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERELIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereLike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERELIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereILike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREILIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereILike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREILIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereILike(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREILIKE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHEREBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNotBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOTBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andWhereNotBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDWHERENOTBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNotBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOTBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereExists(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHEREEXISTS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereExists(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHEREEXISTS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public whereNotExists(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WHERENOTEXISTS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orWhereNotExists(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORWHERENOTEXISTS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public groupBy(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(GROUPBY, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public groupByRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(GROUPBYRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orderBy(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORDERBY, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orderByRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORDERBYRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public partitionBy(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(PARTITIONBY, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public union(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(UNION, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public unionAll(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(UNIONALL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public intersect(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(INTERSECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public except(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(EXCEPT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public having(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andHaving(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDHAVING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orHaving(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORHAVING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orHavingRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORHAVINGRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingNotIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGNOTIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public andHavingNotIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ANDHAVINGNOTIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orHavingNotIn(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORHAVINGNOTIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orHavingBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORHAVINGBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingNotBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGNOTBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public orHavingNotBetween(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ORHAVINGNOTBETWEEN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingNull(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGNULL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public havingNotNull(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(HAVINGNOTNULL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearSelect(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARSELECT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearWhere(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARWHERE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearGroup(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARGROUP, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearOrder(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARORDER, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearHaving(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARHAVING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clearCounters(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEARCOUNTERS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public clear(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(CLEAR, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public offset(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(OFFSET, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public limit(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(LIMIT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public count(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(COUNT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public countDistinct(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(COUNTDISTINCT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public min(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(MIN, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public max(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(MAX, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public sumDistinct(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(SUMDISTINCT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public avg(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(AVG, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public avgDistinct(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(AVGDISTINCT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public insert(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(INSERT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public upsert(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(UPSERT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public update(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(UPDATE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public updateFrom(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(UPDATEFROM, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public modify(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(MODIFY, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public returning(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(RETURNING, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public onConflict(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ONCONFLICT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public increment(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(INCREMENT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public decrement(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DECREMENT, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public del(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DEL, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public delete(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DELETE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public truncate(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(TRUNCATE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public rank(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(RANK, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public denseRank(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(DENSERANK, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public rowNumber(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ROWNUMBER, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public first(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(FIRST, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public pluck(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(PLUCK, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public with(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITH, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withMaterialized(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHMATERIALIZED, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withNotMaterialized(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHNOTMATERIALIZED, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withRaw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHRAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withRecursive(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHRECURSIVE, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withSchema(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHSCHEMA, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public withWrapped(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(WITHWRAPPED, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public raw(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(RAW, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public rows(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(ROWS, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public query(...input: any): MockQuery {
		let dataToAdd: Data = CraftData(QUERY, input, true);
		this.dataArray.push(dataToAdd);
		return this;
	}

	public RESOLVE(data: any) {
		this.dataArray[this.dataArray.length - 1].isMore = false;
		this.dataArray[this.dataArray.length - 1].result = data;
		return;
	}
}

/**
 * MockResolve for code execution. Pass this in as your DB object for the real function.
 *
 * Example:
 * ```
 *  const mockResolveDB = OverallMockKnexInstance.MockDB() as unknown as Knex;
 *
 * (async (db) => {
 *     const query = db("myTable")
 *         .select(["objectName", "id"])
 *         .where("field", "data");
 *     const res = await query;
 *     console.log(res);
 * })(mockResolveDB);
 * ```
 */
class MockResolve implements MockPath {
	private resolveQue: Data[][];
	private currentStack: Data[];
	private config: Config;

	constructor(
		config: Config | null,
		passedResolveQue: Data[][],
		tableName?: string
	) {
		this.resolveQue = passedResolveQue;
		if (config) {
			this.config = config;
		}
		this.currentStack = new Array<Data>();
		if (tableName) {
			let dataToAdd: Data = CraftData(TABLE, tableName, true);
			this.currentStack.push(dataToAdd);
		}
	}

	public column(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(COLUMN, "input", input);
		}
		let dataToAdd: Data = CraftData(COLUMN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public columns(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(COLUMNS, "input", input);
		}
		let dataToAdd: Data = CraftData(COLUMNS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public comment(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(COMMENT, "input", input);
		}
		let dataToAdd: Data = CraftData(COMMENT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public hintComment(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HINTCOMMENT, "input", input);
		}
		let dataToAdd: Data = CraftData(HINTCOMMENT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public from(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(FROM, "input", input);
		}
		let dataToAdd: Data = CraftData(FROM, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public fromRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(FROMRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(FROMRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public into(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(INTO, "input", input);
		}
		let dataToAdd: Data = CraftData(INTO, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public table(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(TABLE, "input", input);
		}
		let dataToAdd: Data = CraftData(TABLE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public join(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(JOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public joinRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JOINRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(JOINRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public innerJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(INNERJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(INNERJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public leftJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(LEFTJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(LEFTJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public leftOuterJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(LEFTOUTERJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(LEFTOUTERJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public rightJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(RIGHTJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(RIGHTJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public rightOuterJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(RIGHTOUTERJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(RIGHTOUTERJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public outerJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(OUTERJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(OUTERJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public fullOuterJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(FULLOUTERJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(FULLOUTERJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public crossJoin(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CROSSJOIN, "input", input);
		}
		let dataToAdd: Data = CraftData(CROSSJOIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public using(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(USING, "input", input);
		}
		let dataToAdd: Data = CraftData(USING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public select(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(SELECT, "input", input);
		}
		let dataToAdd: Data = CraftData(SELECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public distinct(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DISTINCT, "input", input);
		}
		let dataToAdd: Data = CraftData(DISTINCT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public distinctOn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DISTINCTON, "input", input);
		}
		let dataToAdd: Data = CraftData(DISTINCTON, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public jsonExtract(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JSONEXTRACT, "input", input);
		}
		let dataToAdd: Data = CraftData(JSONEXTRACT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public jsonInsert(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JSONINSERT, "input", input);
		}
		let dataToAdd: Data = CraftData(JSONINSERT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public jsonRemove(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JSONREMOVE, "input", input);
		}
		let dataToAdd: Data = CraftData(JSONREMOVE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public jsonSet(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(JSONSET, "input", input);
		}
		let dataToAdd: Data = CraftData(JSONSET, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public as(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(AS, "input", input);
		}
		let dataToAdd: Data = CraftData(AS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public where(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERE, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhere(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERE, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhere(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERE, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNot(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOT, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereNot(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERENOT, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERENOT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNot(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOT, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREIN, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNotIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOTIN, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOTIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREIN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNotIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOTIN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOTIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNull(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENULL, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENULL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNotNull(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOTNULL, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOTNULL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNotNull(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOTNULL, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOTNULL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERERAW, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERERAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERERAW, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERERAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERERAW, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERERAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereWrapped(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREWRAPPED, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREWRAPPED, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingWrapped(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGWRAPPED, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGWRAPPED, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNotJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOTJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOTJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNotJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOTJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOTJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereNotJsonObject(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERENOTJSONOBJECT, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERENOTJSONOBJECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonPath(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONPATH, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONPATH, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonPath(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONPATH, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONPATH, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonPath(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONPATH, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONPATH, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonNotSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONNOTSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONNOTSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonNotSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONNOTSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONNOTSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonNotSupersetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONNOTSUPERSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONNOTSUPERSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereJsonNotSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREJSONNOTSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREJSONNOTSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereJsonNotSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREJSONNOTSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREJSONNOTSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereJsonNotSubsetOf(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREJSONNOTSUBSETOF, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREJSONNOTSUBSETOF, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereLike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERELIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERELIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereLike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERELIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERELIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereLike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERELIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERELIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereILike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREILIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREILIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereILike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREILIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREILIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereILike(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREILIKE, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREILIKE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHEREBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHEREBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNotBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOTBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOTBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andWhereNotBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDWHERENOTBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDWHERENOTBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNotBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOTBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOTBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereExists(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHEREEXISTS, "input", input);
		}
		let dataToAdd: Data = CraftData(WHEREEXISTS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereExists(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHEREEXISTS, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHEREEXISTS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public whereNotExists(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WHERENOTEXISTS, "input", input);
		}
		let dataToAdd: Data = CraftData(WHERENOTEXISTS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orWhereNotExists(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORWHERENOTEXISTS, "input", input);
		}
		let dataToAdd: Data = CraftData(ORWHERENOTEXISTS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public groupBy(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(GROUPBY, "input", input);
		}
		let dataToAdd: Data = CraftData(GROUPBY, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public groupByRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(GROUPBYRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(GROUPBYRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orderBy(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORDERBY, "input", input);
		}
		let dataToAdd: Data = CraftData(ORDERBY, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orderByRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORDERBYRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(ORDERBYRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public partitionBy(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(PARTITIONBY, "input", input);
		}
		let dataToAdd: Data = CraftData(PARTITIONBY, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public union(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(UNION, "input", input);
		}
		let dataToAdd: Data = CraftData(UNION, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public unionAll(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(UNIONALL, "input", input);
		}
		let dataToAdd: Data = CraftData(UNIONALL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public intersect(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(INTERSECT, "input", input);
		}
		let dataToAdd: Data = CraftData(INTERSECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public except(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(EXCEPT, "input", input);
		}
		let dataToAdd: Data = CraftData(EXCEPT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public having(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVING, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andHaving(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDHAVING, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDHAVING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orHaving(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORHAVING, "input", input);
		}
		let dataToAdd: Data = CraftData(ORHAVING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orHavingRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORHAVINGRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(ORHAVINGRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGIN, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingNotIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGNOTIN, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGNOTIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public andHavingNotIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ANDHAVINGNOTIN, "input", input);
		}
		let dataToAdd: Data = CraftData(ANDHAVINGNOTIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orHavingNotIn(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORHAVINGNOTIN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORHAVINGNOTIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orHavingBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORHAVINGBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORHAVINGBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingNotBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGNOTBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGNOTBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public orHavingNotBetween(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ORHAVINGNOTBETWEEN, "input", input);
		}
		let dataToAdd: Data = CraftData(ORHAVINGNOTBETWEEN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingNull(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGNULL, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGNULL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public havingNotNull(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(HAVINGNOTNULL, "input", input);
		}
		let dataToAdd: Data = CraftData(HAVINGNOTNULL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearSelect(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARSELECT, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARSELECT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearWhere(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARWHERE, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARWHERE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearGroup(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARGROUP, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARGROUP, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearOrder(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARORDER, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARORDER, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearHaving(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARHAVING, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARHAVING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clearCounters(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEARCOUNTERS, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEARCOUNTERS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public clear(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(CLEAR, "input", input);
		}
		let dataToAdd: Data = CraftData(CLEAR, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public offset(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(OFFSET, "input", input);
		}
		let dataToAdd: Data = CraftData(OFFSET, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public limit(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(LIMIT, "input", input);
		}
		let dataToAdd: Data = CraftData(LIMIT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public count(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(COUNT, "input", input);
		}
		let dataToAdd: Data = CraftData(COUNT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public countDistinct(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(COUNTDISTINCT, "input", input);
		}
		let dataToAdd: Data = CraftData(COUNTDISTINCT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public min(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(MIN, "input", input);
		}
		let dataToAdd: Data = CraftData(MIN, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public max(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(MAX, "input", input);
		}
		let dataToAdd: Data = CraftData(MAX, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public sumDistinct(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(SUMDISTINCT, "input", input);
		}
		let dataToAdd: Data = CraftData(SUMDISTINCT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public avg(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(AVG, "input", input);
		}
		let dataToAdd: Data = CraftData(AVG, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public avgDistinct(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(AVGDISTINCT, "input", input);
		}
		let dataToAdd: Data = CraftData(AVGDISTINCT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public insert(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(INSERT, "input", input);
		}
		let dataToAdd: Data = CraftData(INSERT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public upsert(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(UPSERT, "input", input);
		}
		let dataToAdd: Data = CraftData(UPSERT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public update(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(UPDATE, "input", input);
		}
		let dataToAdd: Data = CraftData(UPDATE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public updateFrom(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(UPDATEFROM, "input", input);
		}
		let dataToAdd: Data = CraftData(UPDATEFROM, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public modify(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(MODIFY, "input", input);
		}
		let dataToAdd: Data = CraftData(MODIFY, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public returning(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(RETURNING, "input", input);
		}
		let dataToAdd: Data = CraftData(RETURNING, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public onConflict(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ONCONFLICT, "input", input);
		}
		let dataToAdd: Data = CraftData(ONCONFLICT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public increment(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(INCREMENT, "input", input);
		}
		let dataToAdd: Data = CraftData(INCREMENT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public decrement(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DECREMENT, "input", input);
		}
		let dataToAdd: Data = CraftData(DECREMENT, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public del(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DEL, "input", input);
		}
		let dataToAdd: Data = CraftData(DEL, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public delete(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DELETE, "input", input);
		}
		let dataToAdd: Data = CraftData(DELETE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public truncate(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(TRUNCATE, "input", input);
		}
		let dataToAdd: Data = CraftData(TRUNCATE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public rank(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(RANK, "input", input);
		}
		let dataToAdd: Data = CraftData(RANK, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public denseRank(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(DENSERANK, "input", input);
		}
		let dataToAdd: Data = CraftData(DENSERANK, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public rowNumber(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ROWNUMBER, "input", input);
		}
		let dataToAdd: Data = CraftData(ROWNUMBER, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public first(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(FIRST, "input", input);
		}
		let dataToAdd: Data = CraftData(FIRST, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public pluck(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(PLUCK, "input", input);
		}
		let dataToAdd: Data = CraftData(PLUCK, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public with(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITH, "input", input);
		}
		let dataToAdd: Data = CraftData(WITH, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withMaterialized(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHMATERIALIZED, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHMATERIALIZED, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withNotMaterialized(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHNOTMATERIALIZED, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHNOTMATERIALIZED, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withRaw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHRAW, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHRAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withRecursive(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHRECURSIVE, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHRECURSIVE, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withSchema(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHSCHEMA, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHSCHEMA, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public withWrapped(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(WITHWRAPPED, "input", input);
		}
		let dataToAdd: Data = CraftData(WITHWRAPPED, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public raw(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(RAW, "input", input);
		}
		let dataToAdd: Data = CraftData(RAW, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public rows(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(ROWS, "input", input);
		}
		let dataToAdd: Data = CraftData(ROWS, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	public query(...input: any): MockResolve {
		if (this.config && this.config.printData) {
			console.log(QUERY, "input", input);
		}
		let dataToAdd: Data = CraftData(QUERY, input, true);
		this.currentStack.push(dataToAdd);

		return this;
	}

	private findResult(): Data | null {
		// check chains
		for (let index = 0; index < this.resolveQue.length; index++) {
			const resolution = this.resolveQue[index];
			if (resolution.length !== this.currentStack.length) {
				continue;
			}
			let match = true;
			// check individual chain link
			for (
				let innerIndex = 0;
				innerIndex < resolution.length;
				innerIndex++
			) {
				if (this.config && this.config.printData) {
					console.log(
						"find result",
						resolution[innerIndex],
						"VS",
						this.currentStack[innerIndex]
					);
				}
				if (
					resolution[innerIndex].action !=
					this.currentStack[innerIndex].action
				) {
					match = false;
					break;
				}
				if (!resolution[innerIndex].parameters.length) {
					// skip if EXPECT not set
				} else if (
					!_.isEqual(
						resolution[innerIndex].parameters,
						this.currentStack[innerIndex].parameters
					)
				) {
					match = false;
					break;
				}
			}
			// link didn't match, go to next chain
			if (!match) {
				continue;
			}
			// got to end and still matches
			if (
				resolution.length > 0 &&
				resolution[resolution.length - 1].isMore === false
			) {
				return resolution[resolution.length - 1];
			}
		}
		return null;
	}

	valueOf(): any {
		const res = this.findResult();
		if (res) {
			return res.result;
		} else return [];
	}

	then<Res1 = any, Res2 = never>(
		resolve: () => Res1 | PromiseLike<Res1>,
		reject?: () => Res2 | PromiseLike<Res2>
	): Promise<Res1 | Res2> {
		const res = this.findResult();
		let finalRes: any;
		if (res) {
			finalRes = res.result;
		} else finalRes = [];
		return Promise.resolve(finalRes).then(resolve, reject);
	}
}

/**
 * CraftData helper function for creating a new Data object
 * @param {string} action
 * @param {any} parameters
 * @param {boolean} isMore
 */
function CraftData(action: string, parameters: any, isMore: boolean): Data {
	let dataToAdd: Data = {
		action,
		parameters,
		isMore,
	};
	return dataToAdd;
}

/**
 * Config
 * @parameter {boolean} printData
 */
class Config {
	printData: boolean;
}

export {MockKnex};
