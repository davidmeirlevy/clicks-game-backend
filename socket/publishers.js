const {getStep} = require('../models/step');
const {getUser} = require('../models/user');
const {getLastWinner} = require('../models/round');
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

function publishLastWinner(socket) {
	return getLastWinner(socket.user.room)
		.then(winner => {
			return publish(socket, 'lastWinner', winner);
		});
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
			getUser(token)
				.then(user => {
					socket.user = user;
					if (room !== user.room) {
						unSubscribeToRoom(token, room);
					}

					publishUser(socket);
					publishStep(socket);
				});
		});
		publishLastWinner(socket);
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