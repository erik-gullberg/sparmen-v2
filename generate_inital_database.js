const sparm = require('./resources/sparmen.json');
const mysql = require('mysql');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'varglad'
};

const connection = mysql.createConnection(config);

//Populate spex, year and songs into spex and songs table
for(var spex in sparm){                       //Loops through every spex
  for(var year in sparm[spex]){               //Loops through every year
    for(var songNbr in sparm[spex][year]){    //Loops through every song
      var nbr_spex = spex.split('_')          //Divide string (example: 1_En Karnevalssaga -> [1, En Karnevalssaga])
      if(year === 'meta'){
        continue;
      }
      var queryInsertSpex = 'INSERT INTO spex(spex_name, year, context) VALUES (?, ?, NULL)';
      var valuesInsertSpex = [nbr_spex[1], year];
      connection.query(queryInsertSpex, valuesInsertSpex, (err, result) => { //Add spex to spex database with name and year
        if (err) {
          console.error(err);
        } else {
          console.log('Spex was successfully added');
        }
      });
      var queryInsertSong = 'INSERT INTO songs(song_name, text, context, year) VALUES (?, ?, NULL, ?)';
      var song = sparm[spex][year][songNbr];
      var valuesInsertSong = [song['name'], song['text'], year];
      
      connection.query(queryInsertSong, valuesInsertSong, (err, result) => { //Add song to songs database with name, text and year
        if (err) {
          console.error(err);
        } else {
          console.log('Song was successfully added');
        }
      });  
    }

  }
}


connection.end();