const utils = require('./utilz.js');

const uWS = require('uWebSockets.js');
const { v1: uuidv1 } = require('uuid');

const mongo = require('./mongo.js');
const sentinel = require('./Sentinel.js');

function respond(ws, type, data) {
	let payload = {
		type,
		data
	}
	ws.send(JSON.stringify(payload));
}

async function startSentinelServices() {
	sentinel.gatherTargets();
	sentinel.fetchGeoData();	
}
//startSentinelServices(); UNCOMMENT TO USE...

const port = 1300;
const app = uWS.SSLApp({
	key_file_name: utils.k3yc3r7.key_path,
	cert_file_name: utils.k3yc3r7.cert_path
}).ws('/ws', {
	/* Options */
	compression: 0,
	maxPayloadLength: 16 * 1024 * 1024,
	idleTimeout: 0, 
	
	/* Handlers */
	open: (ws, req) => {
		utils.logData('A WebSocket connected via URL: ' + req.getUrl() + '!');
		ws.id = "ws-"+uuidv1();
		
		utils.logData('Sending Websocket Id');
		respond(ws, 'client-websocket-id', ws.id)
		
					
	},
	
	message: async (ws, message) => {
		let tjo = JSON.parse(utils.ArrayBufferToString(message));
		console.log(tjo);
		
		try {
			switch(tjo['type']) {
				case "request-target-plot-data":
					let targets_plot_data = await mongo.aggregate('targets_geo_data',{}, null,null,null, { '$project': { 'map_pos': 1 }});
					//console.log(targets_plot_data);
					respond(ws, 'target-plot-data', targets_plot_data);
					break;
					
				default:
					break;	
			}
		} catch(e) {
			console.log(e)
		}		
		
				
	},
	drain: (ws) => {
		utils.logData('WebSocket backpressure: ' + ws.getBufferedAmount());
	},
	close: (ws, code, message) => {
		utils.logData('WebSocket closed');
	}		
}).listen(port, (token) => {
	if (token) {
		utils.logData('Listening to port ' + port);
	} else {
		utils.logData('Failed to listen to port ' + port);
	}	
});