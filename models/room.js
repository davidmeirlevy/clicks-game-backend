const rooms = ['red', 'green', 'orange', 'pink'];

module.exports = {
	rooms,
	getRoomsObject() {
		return rooms.reduce((result, room) => {
			result[room] = {};
			return result;
		}, {});
	}
};