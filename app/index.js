'use strict';
const db = require('./models/index.js');

db.sequelize.sync({ alter: true })
  .then(() => console.log("Banco sincronizado"))
  .catch(err => console.error("Erro ao sincronizar banco:", err));


const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const PORT = 3000;
const helmet = require('helmet');
const app = express();
const cors = require('cors');
const http = require('node:http');
const server = require('node:http').createServer(app);
const socketIo = require('socket.io');
const ioUtil = require('./io/io');
const path = require('node:path');
ioUtil.setIo(socketIo(server));
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3001", // porta do frontend
    methods: ["GET", "POST"]
  }
});

const home = io.of('/').on('connection', socket => {
  console.log("Connected from Home page.");
});
const queue = io.of('/queue').on('connection', socket => {
  console.log("Connected from Queue page.");
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, "../build")));

let patientController = require('./controllers/patientController');
let queueController = require('./controllers/queueController');
let doctorController = require('./controllers/doctorController');

app.post("/patients/create", patientController.create);

app.get("/queues/gettickets", queueController.getTickets);
app.get("/queues/getactivequeue", queueController.getActiveQueue);
app.get("/queues/getticketswithdoctors", queueController.getTicketsWithDoctors);
app.post("/queues/opennewqueue", queueController.openNewQueue);
app.post("/queues/closeactivequeue", queueController.closeActiveQueue);

app.post("/doctors/adddoctor", doctorController.addDoctor);
app.get("/doctors/getalldoctors", doctorController.getAllDoctors);
app.post("/doctors/toggleduty", doctorController.toggleDuty);
app.get("/doctors/getondutydoctors", doctorController.getOnDutyDoctors);
app.post("/doctors/nextpatient", doctorController.nextPatient);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// start the server
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

