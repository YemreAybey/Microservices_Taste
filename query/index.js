const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

const handleEvents = (type, data) => {
  if (type === "PostCreated") {
    posts[data.id] = { id: data.id, title: data.title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { comments } = posts[data.postId];
    comments.push({
      id: data.id,
      content: data.content,
      status: data.status,
    });
  }

  if (type === "CommentUpdated") {
    const { comments } = posts[data.postId];

    const commentIndex = comments.findIndex(
      (comment) => comment.id === data.id
    );
    comments[commentIndex] = data;
  }
};

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvents(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");

  const res = await axios.get("http://event-bus-srv:4005/events");
  for (let event of res.data) {
    handleEvents(event.type, event.data);
  }
});
