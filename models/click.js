const {throttle, sortBy, values} = require('lodash');
const {promisify} = require('util');
const redis = require('redis');
const {redisUrl} = require('../config');
const {rooms, getRoomsObject} = require('./room');

const client = redis.createClient(redisUrl);
const pub = redis.createClient(redisUrl);
const sub = redis.createClient(redisUrl);

const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

const competitorsUpdate = 'competitorsUpdate';
const delayListUpdate = 300;
const subscribers = getRoomsObject();

const subscribersRunners = rooms.reduce((result, room) => {
	result[room] = throttle(runSubscribers.bind(runSubscribers, room), delayListUpdate);
	return result;
}, {});

sub.on('message', (type, room) => {
	subscribersRunners[room]();
});
sub.subscribe(competitorsUpdate);

function set(key, value) {
	return setAsync(key, JSON.stringify(value));
}

function get(key) {
	return getAsync(key)
		.then(JSON.parse);
}

function addClick(user) {
	if (!user || !subscribersRunners[user.room]) return;

	const key = 'competitors:' + user.room;
	return get(key)
		.then(data => {
			if (!data) {
				data = {};
			}
			if (!data[user.token]) {
				data[user.token] = {name: user.name, clicks: 1};
			} else {
				data[user.token].clicks++;
			}
			set(key, data);
			pub.publish(competitorsUpdate, user.room);
		});
}

function subscribeToRoom(token, room, cb) {
	subscribers[room][token] = cb;
	subscribersRunners[room]();
}

function unSubscribeToRoom(token, room) {
	delete subscribers[room][token];
}

function runSubscribers(room) {
	get('competitors:' + room)
		.then((competitors) => {
			if (!competitors) {
				return;
			}
			const list = sortBy(Object.values(competitors), item => -item.clicks);
			values(subscribers[room]).forEach(cb => cb(list));
		});
}


module.exports = {
	addClick,
	subscribeToRoom,
	unSubscribeToRoom
};