//linux command last|head ,, whiteout
//https://www.freecodecamp.org/news/a-complete-mongodb-tutorial/
//https://github.com/javascriptteacher/mongo.api
//https://www.comparitech.com/blog/vpn-privacy/change-location-chrome-firefox-spoof/
//https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API


//https://linux.die.net/man/1/lastb
//https://www.commandlinefu.com/commands/using/lastb
//nice find failed auths ,, blackout
//https://www.thegeekdiary.com/how-to-check-failed-or-bad-login-attempts-in-linux/
//lastb -a | more
//lastb -F | more


const fs = require('fs');
//const readline = require('readline');
//https://stackabuse.com/executing-shell-commands-with-node-js/
const { exec } = require("child_process");


const axios = require('axios');
const ipRegex = require('ip-regex');
const mongo = require('./mongo.js');

function World2Image(pointLat, pointLon) {
    // console.log(arguments);
    const mapWidth = 920;
    const mapHeight = 468;
    const x =  ((mapWidth / 360.0) * (180 + pointLon));
    const y =  ((mapHeight / 180.0) * (90 - pointLat));
    return [x, y];
}

//Array diff checker
Array.prototype.diff = function(ary) { return this.filter(x => !ary.includes(x)); }

function gatherTargets() {	
	setTimeout(
	    function() {
			console.log("Gathering Targets...");
			mongo.insertOne('logs', { ts: new Date().toISOString(), msg: 'Gathered Targets', type: 'general' });
			
			//lastb | awk '{if ($3 ~ /([[:digit:]]{1,3}\.){3}[[:digit:]]{1,3}/)a[$3] = a[$3]+1} END {for (i in a){print i " : " a[i]}}' | sort -nk 3
			exec(`lastb | awk '{if ($3 ~ /([[:digit:]]{1,3}\.){3}[[:digit:]]{1,3}/)a[$3] = a[$3]+1} END {for (i in a){print i " : " a[i]}}' | sort -nk 3`, async (error, stdout, stderr) => {
			    if (error) {
			        console.log(`error: ${error.message}`);
			        return;
			    }
			    if (stderr) {
			        console.log(`stderr: ${stderr}`);
			        return;
			    }
			    
			    let data = stdout;
			    data = data.split("\n");
			    
			    //console.log(data);
			    
			    data = data.map((str) => {
			       return str.replace(/\s+/g,'').trim().split(':');
		        });
		        
		        let targets = [];
		        data.forEach((item) => {
			        targets.push({ ip: item[0], hits: parseInt(item[1]) });
		        });
		        
		        //console.log(targets);		        
		        await mongo.emptyCollection('targets');
			    await mongo.insertMany('targets', targets);					
			});
		
			gatherTargets();			
	    }
	    .bind(this),
	    60000 * 60
	);
}	

//https://ipwhois.io/
//http://free.ipwhois.io/json/8.8.4.4

let errors = [];
let requests = [];
let processing_geo_data = false;
function fetchGeoData() {
	setTimeout(
		async function() {
			if(processing_geo_data === false) {
				console.log("Fetching Geo Data...");
				mongo.insertOne('logs', { ts: new Date().toISOString(), msg: 'Fetching Geo Data', type: 'general' });

			    errors = [];
				requests = [];
				processing_geo_data = true;	
				
				
				let i = 0;
				let p = 0; //used for diff.forEach recognize all iterated...
				let page = [];
				
				let targets = await mongo.distinct('targets','ip');
				let proccessed = await mongo.distinct('targets_geo_data','ip');
				
				let diff = targets.diff(proccessed);
				//console.log(diff);
				
				
				diff.forEach((t) => {											
					p++;
					if(ipRegex({exact: true}).test(t) && t != "") {
						//Create pages of 10 to collect geo data on that way we dont flood server
						page.push(axios.get(`http://free.ipwhois.io/json/${t}`).catch(error => { errors.push(error); }));	
						i++;
						if(i === 10 || p === diff.length) { requests.push(page); i = 0; page = []; }
					}	
				});
				
				//console.log(requests);
				i = 0; //reuse
				function doReqBatch(req_batch_index) {
					console.log(`Processing Req Batch(${req_batch_index})`);
					Promise.all(requests[req_batch_index]).then(async (results) => {
						
						//Filter null undefined failed requests....
						let reqDataSet = results.filter(function (el) {
						  return el != null;
						});
						
						reqDataSet = reqDataSet.map(({ data }) => data);
						
						//add map data
						reqDataSet.forEach((item,rbdsi) => {
							reqDataSet[rbdsi]['map_pos'] = World2Image(Math.floor(item.latitude), Math.floor(item.longitude));
						});						
						
						console.log('BATCH LENGTH: ', reqDataSet.length)
						console.log('BATCH IS ARRAY: ', Array.isArray(reqDataSet));
						if(reqDataSet.length > 0 && Array.isArray(reqDataSet)) {										
							try { 
								await mongo.insertMany('targets_geo_data', reqDataSet); 
																
							} catch(e) { console.log("error processing req batch...", e)} 
						}
						i++;
						if(i < requests.length) { doReqBatch(i); } else if(i === requests.length) {  console.log('Done Processing All Batches...'); processing_geo_data = false; }
						
						
					}).catch((e) => console.log(e));	
				}	
				doReqBatch(0);
			} else {
				console.log("Still processing last deo data request set.")
			}
		}
		.bind(this),
		(60000 * 60) + 30000 //every hour and 30sec
	);
}

module.exports = {
	gatherTargets,
	fetchGeoData
}	