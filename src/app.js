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
    origin: "*",
  })
);
app.use(flash());
app.use(express.json());
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
    }),
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", AuthRoute);

app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));
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
