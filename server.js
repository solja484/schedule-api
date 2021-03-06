const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const server = express();
const port = 3080;
const router = require('./routes/router');

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true,}));
server.use(express.static(path.join(__dirname, '../schedule-vue/build')));
server.get('/', (req, res) => {
    res.json({'message': 'ok'});
});

server.use('/api', router);

// Error handler middleware
server.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({'message': err.message});
    return;
});

server.listen(port, () => {
    console.log('listening to ' +port)
});