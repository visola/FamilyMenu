var express = require('express');
var mysql = require('mysql');
var app = express();
var connection;

if (process.env.DATABASE_URL) {
  connection = mysql.createConnection(process.env.DATABASE_URL);
} else {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'familyMenu'
  });
}

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

function getKey(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

app.get('/items', function (req, resp) {
  connection.connect();
  connection.query('select * from items', function (err, rows, fields) {
    var result = {};
    rows.forEach(function (row, index) {
      var day = result[getKey(row.day)];
      if (!day) {
        day = {LUNCH: [], DINNER: []};
        result[getKey(row.day)] = day;
      }

      day[row.meal].push(row.item);
    });

    resp.json(result);
  });
  connection.end();
});

app.listen(app.get('port'), function() {
  console.log('Server is running on port', app.get('port'));
});
