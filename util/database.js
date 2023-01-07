//used to connect to database and send queries

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'fireup'
});

module.exports = pool.promise();  //exports promise of pool (to asyncronously call queries)