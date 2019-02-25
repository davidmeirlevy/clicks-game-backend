const {getStep} = require('../models/step');
const {subscribeToRoom} = require('../models/click');


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
	subscribeToRoom(token, room, list => {
		publish(socket, 'ranksUpdated', list);
	});
}

module.exports = {
	publishUser,
	publishStep,
	publishPong,
	createRoomPubSub,
};