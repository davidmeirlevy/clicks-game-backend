const {getStep} = require('../models/step');
const {getUser} = require('../models/user');
const {subscribeToRoom, unSubscribeToRoom} = require('../models/click');
const {rooms} = require('../models/room');
const {subscribeToRound} = require('../models/round');


function publish(socket, eventName, data) {
	return socket.emit(eventName, JSON.stringify(data));
}

function publishUser(socket) {
	return publish(socket, 'user', socket.user);
}

function publishPong(socket) {
	return publish(socket, 'pong', null);
}

function publishStep(socket) {
	const step = getStep(socket.user);
	return publish(socket, 'currentStep', step);
}

function createRoomPubSub(socket) {
	const {token, room} = socket.user;
	if (token && rooms.includes(room)) {
		console.log('subscribe to room', token, room);
		subscribeToRoom(token, room, list => {
			publish(socket, 'ranksUpdated', list);
		});
		subscribeToRound(token, room, winner => {
			publish(socket, 'lastWinner', winner);
			unSubscribeToRoom(token, room);
			socket.user.room = null;
			publishUser(socket);
			publishStep(socket);
		});
	}
}

function createAllRoomsPubSub(socket) {
	rooms.forEach(room => {
		subscribeToRoom(socket.user.token, room, list => {
			publish(socket, 'ranksUpdated:all', {[room]: list});
		});
		subscribeToRound(socket.user.token, room, winner => {
			publish(socket, 'lastWinner:all', {[room]: winner});
		});
	});
}

module.exports = {
	publishUser,
	publishStep,
	publishPong,
	createRoomPubSub,
	createAllRoomsPubSub,
};