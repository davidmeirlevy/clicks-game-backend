const {promisify} = require('util');
const redis = require('redis');
const {redisUrl} = require('./config');

const client = redis.createClient(redisUrl);

const keysAsync = promisify(client.keys).bind(client);
const delAsync = promisify(client.del).bind(client);


async function run() {
	await keysAsync('*').then(keys => {
		console.log('all keys', keys);

		return Promise.all(keys.map(delAsync))
	});
}

run().then(() => process.exit());