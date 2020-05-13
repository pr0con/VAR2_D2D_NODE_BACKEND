const utils = require('./utilz.js'); 

const mongo = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;


MongoClient.connect(utils.system_configuration['system']['databases']['mongo']['url'], {  useUnifiedTopology: true, useNewUrlParser: true }, ConfigureAPI);


let api = null;
function ConfigureAPI(err, db) {
	if(!err) {
		api = db.db('api');
		
		utils.logData("Mongo Connected & API Configured...");
	} else if(err) { utils.logData('Mongo Not Connected'); return; }
}

async function emptyCollection(collection) {
	let result = await api.collection(collection).deleteMany({});
	return result;
}

async function insertOne(collection, doc) {
	let res = await api.collection(collection).insertOne(doc).then((result) => {
		return doc; //So this literally just attaches the insert id to this. SWEET...
	});
	
	//console.log(doc);
	return doc; 	
}

async function distinct(collection, field) {
	let result = await api.collection(collection).distinct(field);
	return result;
}


async function insertMany(collection, data) {
	let result = await api.collection(collection).insertMany(data);
	return result.insertedIds;
	//console.log(result);
}

async function aggregate(collection, match, sort, skip, limit, project) {
	let count = await api.collection(collection).find(match).count();
	
	
	let aggAry = [];
	( match !== null ) ? aggAry.push({'$match': match }) : '';
	( sort !== null ) ? aggAry.push(sort) : '';
	( skip !== null ) ? aggAry.push(skip) : '';
	( limit !== null ) ? aggAry.push(limit) : '';
	( project !== null) ? aggAry.push(project) : '';
	
	console.log(aggAry);
	
	
	let cursor = await api.collection(collection).aggregate(aggAry)	
	
	let docs = [];
	while(await cursor.hasNext()) {	//is there anything left?
		const doc = await cursor.next(); //iternate one
		docs.push(doc);
	}
	
	docs = { count: parseInt(count), [`${collection}`]: docs}; // docs.reverse()
	return docs;		
}



module.exports = {
	emptyCollection,
	
	insertOne,
	insertMany,
	
	distinct,
	aggregate,
}