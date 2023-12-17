const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { createCanvas, loadImage } = require("canvas");
const { MongoClient } = require("mongodb");
const process = require("node:process");
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const pixels = new Map();
let socketsNumber = 0;
let dataURL;

const CELL_SIDE_COUNT = 250;
const width = 5000;
const cellPixelLength = width / CELL_SIDE_COUNT;

async function getCanvasDataURL() {
  try {
    const client = new MongoClient(process.env.DB_STRING);
    const db = client.db("canvas");
    const collection = db.collection("tiles");
    client.connect();
    const findData = await collection.findOne({ _id: 1 });
    client.close();
    return findData;
  } catch (error) {
    console.log(error);
  }
}

async function modifCanvasDataURL(data) {
  try {
    const client = new MongoClient(process.env.DB_STRING);
    const db = client.db("canvas");
    const collection = db.collection("tiles");
    client.connect();
    await collection.updateOne({ _id: 1 }, { $set: { t: data } });
    client.close();
  } catch (error) {
    console.log(error);
  }
}

io.on("connection", (socket) => {
  socketsNumber += 1;

  if (socketsNumber == 1) {
    console.log(
      "---\nFirst session user connected, canvas has been loaded from database."
    );

    getCanvasDataURL()
      .then((data) => {
        dataURL = data;
      })
      .finally(() => {
        io.emit("drawCanvasDataURL", dataURL);
      });
  } else {
    console.log("---\nA user has connected.");
    console.log("User(s) connected : " + socketsNumber);
    io.emit("drawCanvasDataURL", dataURL);
  }

  socket.on("dataURldone", () => {
    let transitPixels = JSON.stringify(Array.from(pixels));
    io.emit("drawInitPixels", transitPixels);
  });

  socket.on("addPixel", (data) => {
    pixels.set(data.coord, data.color);
    io.emit("drawPixel", data);
  });

  socket.on("disconnect", function () {
    socketsNumber -= 1;
    if (socketsNumber == 0) {
      const canvas = createCanvas(width, width);
      const ctx = canvas.getContext("2d");

      loadImage(dataURL.t)
        .then((image) => {
          ctx.drawImage(image, 0, 0, width, width);
        })
        .finally(() => {
          pixels.forEach((value, key) => {
            const x = key % CELL_SIDE_COUNT;
            const y = Math.floor(key / CELL_SIDE_COUNT);
            const startX = x * cellPixelLength;
            const startY = y * cellPixelLength;
            ctx.fillStyle = value;
            ctx.fillRect(startX, startY, cellPixelLength, cellPixelLength);
          });
          modifCanvasDataURL(canvas.toDataURL());
          console.log(
            "---\nNo more users connected, canvas has been saved to database."
          );
        });
    } else {
      console.log("---\nA user has disconnected.");
      console.log("User(s) connected : " + socketsNumber);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log("localhost:" + port);
});
