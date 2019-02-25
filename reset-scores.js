const {promisify} = require('util');
const redis = require('redis');
const {redisUrl} = require('./config');

const client = redis.createClient(redisUrl);


const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);


function set(key, value) {
	return setAsync(key, JSON.stringify(value));
}

function get(key) {
	return getAsync(key)
		.then(JSON.parse);
}



async function run() {
	await Promise.all(['red', 'green', 'orange', 'pink'].map(async room => {
		const key = 'competitors:' + room;
		return get(key)
			.then(data => {
				if(!data) return;
				let winner = null;
				Object.values(data).forEach(obj => {
					if (!winner || winner.clicks < obj.clicks) {
						winner = {...obj};
					}
					obj.clicks = 0
				});
				console.log('winner for ' + room, winner);
				set(key, data);
				set('lastWinner:' + room, winner);

				client.publish('newRound', null);
			});
	}));
}

run().then(() => process.exit());