const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());
/** comment */

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;
  console.log(commentsByPostId);

  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  if (type === "CommentModerated") {
    const commentIndex = commentsByPostId[data.postId].findIndex(
      (comment) => comment.id === data.id
    );
    commentsByPostId[data.postId][commentIndex] = data;
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data,
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
