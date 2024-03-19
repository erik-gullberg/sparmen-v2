// Node.js
const mysql = require('mysql');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database'
};

const connection = mysql.createConnection(config);

connection.query('SELECT * FROM songs', (err, results) => {
  if (err) throw err;
  console.log(results);
});

connection.end();