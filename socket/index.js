const socketIO = require('socket.io');
const subscribers = require('./subscribers');

function initSocket(server) {
	const io = socketIO(server);

	io.on('connection', (socket) => {
		subscribers.forEach(func => func(socket));
	});
}


module.exports = {
	initSocket
};