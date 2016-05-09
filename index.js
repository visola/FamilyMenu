var express = require('express');
var bodyParser = require('body-parser');
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
app.use(bodyParser.json());

function getKey(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

app.get('/items', function (req, resp) {
  connection.query('SELECT * FROM items', function (err, rows, fields) {
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
});

app.put('/items/:day/:meal', function (req, resp) {
  var i,
    items = req.body || [];
  connection.query("DELETE FROM items WHERE day = ? AND meal = ?", [req.params.day, req.params.meal]);
  for (i = 0; i < items.length; i++) {
    connection.query("INSERT INTO items (day, meal, item) VALUES (?,?,?)", [req.params.day, req.params.meal, items[i]]);
  }
  resp.sendStatus(204);
});

app.listen(app.get('port'), function() {
  console.log('Server is running on port', app.get('port'));
});
