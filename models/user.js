const {promisify} = require('util');
const uniqid = require('uniqid');
const {redisUrl} = require('../config');
const redis = require('redis');
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

function getUser(token) {
	if (!token) return createUser();
	return get('user:' + token)
		.then(user => {
			if (user) return user;
			return Promise.reject();
		})
		.catch(() => createUser());
}

function createUser() {
	const token = uniqid();
	return set('user:' + token, {name: null, room: null, token})
		.then(() => get('user:' + token));
}

function updateUser(data) {
	set('user:' + data.token, data);
}


module.exports = {
	getUser,
	updateUser,
};