
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const serverInfo = require('./config/config.json')[env]

const Sequelize = require('sequelize');
var sequelize = new Sequelize(serverInfo.database, 
    serverInfo.username, serverInfo.password,{
    host: serverInfo.host,
    dialect: serverInfo.dialect
})

sequelize.authenticate().then(() => {
    console.log('Connection established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit();
}).finally(() => {
    sequelize.close();
});

module.exports = sequelize;
global.sequelize = sequelize;