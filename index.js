const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");
const redis = require("redis");
const cors = require("cors");
let redisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authsource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("succesfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

const app = express();
const port = process.env.PORT || 3000;

app.enable("trust proxy");
app.use(cors({}));

app.use(
  session({
    store: new redisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000, // 60s
    },
  })
);

// to be able to pass request body with express
app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi There</h2>");
  console.log("yes it ran");
});

// localhost:3000/api/v1/posts/
app.use("/api/v1/posts", postRouter);
// localhost:3000/api/v1/users/
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
