const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

//connect and listen to changes in the postgres db
var io = require('socket.io').listen(5000);
var pg = require ('pg');

var con_string = 'tcp://username:password@localhost/dbname';

var pg_client = new pg.Client(con_string);
pg_client.connect();
var query = pg_client.query('LISTEN addedrecord');

io.sockets.on('connection', function (socket) {
    socket.emit('connected', { connected: true });

    socket.on('ready for data', function (data) {
        pg_client.on('notification', function(title) {
            socket.emit('update', { message: title });
        });
    });
});


//notification 
const app = express();

app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());

const publicVapidKey = 'BE4xnj8R9jjfPTw3AbOhFrB6BmiMv8YsyarkJ_hmOUzNehL33x6DhqwQHCnemhc5onAu5RftM3sf8yBs-hqicEU';
const privateVapidKey = 'LbrBsWqBXkubLbeqNJXNhCM7F-9T7pg2mrzpwPjwmHE';

webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
  );

//Route for subscribe
app.post("/subscribe", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Notifiy" });

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));