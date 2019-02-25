const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const {initSocket} = require('./socket');

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.get('/health', function (req, res) {
	res.status(200).send();
});
app.use(morgan('combined'));
app.use(express.json());

const server = app.listen(
	port,
	() => console.log('server is up on port ' + port)
);

initSocket(server);
