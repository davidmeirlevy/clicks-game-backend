const {promisify} = require('util');
const redis = require('redis');
const {rooms} = require('./models/room');
const {redisUrl} = require('./config');

const client = redis.createClient(redisUrl);


const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);
const keysAsync = promisify(client.keys).bind(client);


function set(key, value) {
	return setAsync(key, JSON.stringify(value));
}

function get(key) {
	return getAsync(key)
		.then(JSON.parse);
}

async function run() {
	await Promise.all(rooms.map(async room => {
		const key = 'competitors:' + room;
		return get(key)
			.then(data => {
				if (!data) return;
				let winner = null;
				Object.values(data).forEach(obj => {
					if (!winner || winner.clicks < obj.clicks) {
						winner = obj;
					}
				});
				console.log('winner for ' + room, winner);
				set(key, []);
				set('lastWinner:' + room, winner);

				client.publish('newRound', null);
			});
	}));

	await keysAsync('*').then(keys => {
		console.log('all keys', keys);

		return Promise.all(
			keys
				.filter(key => key.startsWith('user:'))
				.map(key => get(key)
					.then(data => set(key, {...data, room: null}))
				)
		)
	});
}

run().then(() => process.exit());