require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { MONGO_URI, SECRET } = require("./config");

const passport = require("./services/passport");
const AuthRoute = require("./routes/Auth");
const flash = require("express-flash");

const app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"], // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", AuthRoute);

app.engine("html", require("ejs").renderFile);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

const PORT = process.env.PORT || 5001;
mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("conected to mongo database"))
  .catch((e) => console.error(e));

app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
