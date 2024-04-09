const express = require("express");
const app = express();
const connection = require("./database");
const bodyParser = require("body-parser");
const Socket = require("socket.io");
//const modulfunc = require(__dirname + "/testing.js");
const server = require("http").createServer(app);

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let dbTopics = [];
let dbChats = [];

io.on("connection", (socket) => {
  console.log(socket.id + "heeyya");

  // retrieve data from db to rerender on new connection

  let queryTopics = "SELECT * FROM topics";
  connection.query(queryTopics, function (err, result) {
    if (err) throw err;
    //console.log(result);
    dbTopics = result;
    //console.log(dbTopics);
    io.sockets.emit("newConnection", dbTopics);
  });

  // retrieve all chats from database table

  //io.sockets.emit("newConnection", dBtopics);

  //listen to topic event, insert topic to table and emit back the message

  socket.on("topic", (message) => {
    //console.log(message);
    /*let queryTopics = "SELECT * FROM lcsslab0";
    connection.query(sqlQuery, function (err, result) {
      if (err) throw err;
      //console.log(result);
    });*/
    var sql = "INSERT INTO topics ( topics) VALUES (?)";
    connection.query(sql, [message], function (err, result) {
      if (err) throw err;
      // console.log("1 record inserted");
    });

    io.sockets.emit("broadcast", message);
  });

  // listen to chat(message) event and emit back the message

  socket.on("message", (message) => {
    console.log(message);

    // COMEBACKNOW

    //var sql = "INSERT INTO chats ( topics) VALUES (?)";
    //connection.query(sql, [message], function (err, result) {
    //if (err) throw err;

    val = [[topic, message.message, message.sender]];

    var sql = "INSERT INTO chats ( topic_id,name,message) VALUES (?)";
    connection.query(sql, val, function (err, result) {
      if (err) throw err;
    });

    let dbupdate = `SELECT * FROM chats WHERE topic_id=${topic}`;
    connection.query(dbupdate, function (err, result) {
      if (err) throw err;
      //console.log(result);
      let dbChatsSend = result;
    });

    //console.log(message);
    io.sockets.emit("broadcastMessage", dbChatsSend);

    socket.emit("linker", dbChats);
  });

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(express.static("public"));

  app.set("view engine", "ejs");
  let topic = "";

  let Polls = [];
  let chats = [];

  //modulfunc.testfunc1();
  //modulfunc.t2();

  app.get("/", function (req, res) {
    res.render("index");

    let sqlQuery = "SELECT * FROM lcsslab0";
    connection.query(sqlQuery, function (err, result) {
      if (err) throw err;
      //console.log(result);
    });
  });

  app.get("/chat", function (req, res) {
    //topic = req.query.topic_name;
    // res.render("chat", { chats: chats, topic: topic });
    //console.log(chats);
  });

  app.post("/chat", function (req, res) {
    let chat = {
      sender: req.body.sender,
      message: req.body.message,
    };
    chats.push(chat);
    //console.log(chats);
    res.redirect("/chat");
  });

  app.post("/", function (req, res) {
    let newPoll = req.body.newPoll;

    Polls.push(newPoll);

    res.redirect("/");
  });

  app.get("/chat/:topic_id", function (req, res) {
    topic = req.params.topic_id;

    let queryChart = `SELECT * FROM chats WHERE topic_id=${topic}`;
    connection.query(queryChart, function (err, result) {
      if (err) throw err;
      //console.log(result);
      dbChats = result;
      //console.log(dbChats);

      //console.log(topic);

      res.render("chat");
    });
  });

  server.listen(8000, function () {
    var date = new Date();
    console.log(`Server started at ${date} and listening on port 8000`);
    connection.connect(function (err) {
      if (err) throw err;
      console.log("database connected");
    });
  });
});
