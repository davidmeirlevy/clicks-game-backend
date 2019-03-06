const {values} = require('lodash');
const {promisify} = require('util');
const redis = require('redis');
const {rooms, getRoomsObject} = require('./room');

const {redisUrl} = require('../config');

const client = redis.createClient(redisUrl);
const sub = redis.createClient(redisUrl);

const getAsync = promisify(client.get).bind(client);

const roundUpdate = 'newRound';
const subscribers = getRoomsObject();

sub.on('message', () => {
	rooms.forEach(room => {
		runSubscribers(room);
	})
});
sub.subscribe(roundUpdate);

function get(key) {
	return getAsync(key)
		.then(JSON.parse);
}

function getLastWinner(room) {
	return get('lastWinner:' + room);
}

function subscribeToRound(token, room, cb) {
	subscribers[room][token] = cb;
	getLastWinner(room)
		.then(winner => {
			if (winner) cb(winner);
		})
}

function unSubscribeToRound(token, room) {
	delete subscribers[room][token];
}

function runSubscribers(room) {
	getLastWinner(room)
		.then((winner) => {
			if (!winner) {
				return;
			}
			values(subscribers[room]).forEach(cb => cb(winner));
		});
}


module.exports = {
	subscribeToRound,
	unSubscribeToRound,
};