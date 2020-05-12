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


