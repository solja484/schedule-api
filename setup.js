const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const server = express();
const router = require('./routes/router');

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true,}));
server.use(express.static(path.join(__dirname, '../schedule-vue/build')));
server.get('/', (req, res) => {
    res.json({'message': 'ok'});
});

server.use('/api', router);


module.exports = server;
