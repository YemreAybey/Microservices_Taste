const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "refected" : "approved";
    data.status = status;
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentModerated",
      data,
    });
  }

  res.send({ status: "OK" });
});

app.listen(4003, () => {
  console.log("Listening on 4003");
});
