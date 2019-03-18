const {throttle} = require('lodash');
const {getUser, updateUser} = require('../models/user');
const {unSubscribeToRoom, addClick} = require('../models/click');
const {unSubscribeToRound} = require('../models/round');
const {publishUser, publishStep, publishPong, createRoomPubSub, createAllRoomsPubSub} = require('./publishers');

function on(socket, event, cb) {
	socket.on(event, data => {
		cb(JSON.parse(data));
	});
}

function register(socket) {
	on(socket, 'register', (token) => {
		getUser(token)
			.then(user => socket.user = user)
			.then(() => publishUser(socket))
			.then(() => {
				if (socket.user && socket.user.room) {
					createRoomPubSub(socket);
				}
			})
	});
}

function disconnect(socket) {
	socket.on('disconnect', () => {
		if (socket.user && socket.user.room) {
			unSubscribeToRoom(socket.user.token, socket.user.room);
			unSubscribeToRound(socket.user.token, socket.user.room);
		}
		console.log(`Client disconnected`);
	});
}

function whatsNext(socket) {
	on(socket, 'whatsNext', () => {
		publishStep(socket);
	});
}

function updateNickname(socket) {
	on(socket, 'updateNickname', (nickname) => {
		if (typeof nickname === 'string') {
			socket.user.name = nickname;
			updateUser(socket.user);
			publishUser(socket);
		}
	});
}

function updateRoom(socket) {
	on(socket, 'updateRoom', (roomName) => {
		if (typeof roomName === 'string') {
			socket.user.room = roomName;
			updateUser(socket.user);
			publishUser(socket);
			createRoomPubSub(socket);
		}
	});
}

function onPing(socket) {
	on(socket, 'ping', () => {
		publishPong(socket);
	});
}

function onClick(socket) {
	const throttledAddClick = throttle(addClick, 10);
	on(socket, 'clicked', () => {
		throttledAddClick(socket.user);
	});
}


function allRooms(socket) {
	on(socket, 'allRooms', () => {
		createAllRoomsPubSub(socket);
	});
}

module.exports = [
	register,
	disconnect,
	whatsNext,
	updateNickname,
	updateRoom,
	onPing,
	onClick,
	allRooms,
];