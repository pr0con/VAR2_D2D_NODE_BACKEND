const os = require('os');
const fs = require('fs');

/* You will want to change these... */
const k3yc3r7  = {
	key: fs.readFileSync('/etc/letsencrypt/live/var2.pr0con.com/privkey.pem'), 
	cert: fs.readFileSync('/etc/letsencrypt/live/var2.pr0con.com/cert.pem'),
	key_path: '/etc/letsencrypt/live/var2.pr0con.com/privkey.pem',
	cert_path: '/etc/letsencrypt/live/var2.pr0con.com/cert.pem', 
};

var jwtPublicKey = fs.readFileSync('/var/www/keycertz/mykey.pub', 'utf8');
var jwtPrivateKey = fs.readFileSync('/var/www/keycertz/mykey.pem', 'utf8');

const system_configuration = {
	"system": {
		"databases": {
			"mongo": {
				"url": "mongodb://mongod:SOMEHARDPASSWORD@127.0.0.1:27017?authMechanism=SCRAM-SHA-1&authSource=admin",
			}
		}
	}
}

function logData(message) {
	var d = new Date();
	var time = '[' + d.getHours() + ':' + d.getMinutes() + ':' +d.getSeconds() + '] ';
	
	console.log(time + message);
}

module.exports = {
	k3yc3r7,
	jwtPublicKey,
	system_configuration,
	
	logData,
	
	ArrayBufferToString: function(buffer, encoding) {
		if (encoding == null) encoding = 'utf8'
		return Buffer.from(buffer).toString(encoding)
	}	
}