const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const bodyParser = require("body-parser");
const _port = process.env._port || 4000;

let mysql = require("mysql");
let config = require("./config.js");

const app = express();
const server = http.createServer(app);
// const server=http.createServer(app);
const io = socketio(server,{'pingInterval': 3000});
let people = [];




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
// +'#'+socket.handshake.query['name']
app.post("/api/sendreply", function (req, res) {
  console.log("Request body:", req.body);
  var string = JSON.stringify(req.body);
  var objectValue = JSON.parse(string);
  console.log("Request came from " + objectValue["Mobile"]);
  var response = [];
  response.push(objectValue["Message"]);
  response.push(objectValue["botreply"]);
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  var hoursint = (h + 24) % 12 || 12;
  if ((hoursint.length = 1)) {
    hoursint = "0" + hoursint.toString();
  }
  if ((m.length = 1)) {
    m = "0" + m.toString();
  }
  response.push(hoursint + ":" + m + ":" + s + " " + (h > 11 ? " PM" : " AM"));
  response.push(objectValue["Mobile"]);
  response.push(objectValue["ProgramCode"]);
  console.log(response);
  //socket.broadcast.to(objectValue["Mobile"]).emit("message", objectValue["Message"])
  // io.emit(objectValue["Mobile"],response);
  console.log(objectValue["Mobile"] + objectValue["ProgramCode"]);

  if(objectValue["Mobile"]!=null && objectValue["Mobile"]!='' && objectValue["ProgramCode"]!=null && objectValue["ProgramCode"]!=''){
///Connaction 
    try{
      io.emit(objectValue["Mobile"] + (objectValue["ProgramCode"]).toLowerCase(), response);
    }
    catch(e){

      let connection1 = mysql.createConnection(config);
      let sql1 =
        'CALL SP_HSWeebhookChatInsert("' + objectValue["ProgramCode"] + '","' + e.message + '",1,"' + objectValue["Mobile"] +'",' + btrply +")";
      console.log(sql1);
      connection1.query(sql1, true, (error1, results1, fields1) => {
        if (error1) {
          return console.error(error1.message);
        }
        console.log(results1[0]);
      });
      connection.end();
    }

      
  var btrply = 0;
  var botreply = objectValue["botreply"];
  if (botreply) {
    btrply = 1;
  }
  console.log("botreply :" + btrply);

  let connection = mysql.createConnection(config);
  let sql =
    'CALL SP_HSWeebhookChatInsert("' + objectValue["ProgramCode"] + '",?,1,"' + objectValue["Mobile"] +'",' + btrply +")";
  console.log(sql);
  connection.query(sql,objectValue["Message"].toString(), (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    console.log(results[0]);
  });
  connection.end();
  }else{
      res.sendStatus(400);
      }
  res.sendStatus(200);
});
io.on("connection", (socket) => {
  people.push(socket.id);
  // console.log(socket.handshake.query['name']);
  console.log("People Count :" + people.length);
  console.log("We have a new connection , his/her ID :" + socket.id);
  socket.emit("message", { user: socket.id, message: "New Reply" });
  socket.on("disconnect", () => {
    console.log("User Left chat " + socket.id);
    people.splice(people.indexOf(socket.id), 1);
    console.log("People Count :" + people.length);
  });
});

server.listen(_port, () =>
  console.log("Socket Server started and listing on 4000 port")
);
