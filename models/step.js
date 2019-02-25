const STEPS = [
	{
		message: 'Please enter your nickname',
		name: 'nickname',
		action: 'updateNickname'
	},
	{
		message: 'Please select a room to play',
		name: 'room',
		action: 'updateRoom',
		options: ['red', 'green', 'orange', 'pink']
	},
	{
		message: 'Go play with your friends',
		name: 'play',
		action: 'clicked'
	}
];

function getStep(user = {}) {
	if (!user.name) {
		return STEPS[0];
	}
	if (!user.room) {
		return STEPS[1];
	}
	return STEPS[2];
}

module.exports = {
	getStep,
};