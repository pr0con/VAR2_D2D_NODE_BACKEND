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
const readline = require('readline');
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

function gatherTargets() {	
	setTimeout(
	    function() {
			mongo.insertOne('logs', { ts: new Date().toISOString(), msg: 'Gathered Targets', type: 'general' });
		
			gatherTargets();			
	    }
	    .bind(this),
	    60000 * 60
	);
}		