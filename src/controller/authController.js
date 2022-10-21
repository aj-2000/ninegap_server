const User = require("../models/User");

const login = (req, res) => {
  return res.status(200).json({ msg: "user sucessfully logged in" });
};

const signup = async (req, res) => {
  const { email, firstName, lastName, password, profilePhoto, source } =
    req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      let newUser = new User({
        email,
        firstName,
        lastName,
        password,
        profilePhoto,
        source: source || "local",
      });
      await newUser.save();
      return res.status(200).json({ msg: "user successfully created" });
    }
    return res
      .status(422)
      .json({ errors: ["the user with this email already exists"] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: ["some error occured"] });
  }
};

const logout = (req, res) => {
  console.log(req);
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
  //   req.logout()/
};

const me = async (req, res) => {
  console.log(req)
  if (!req.user)
    return res.status(403).json({ errors: ["login to get the info"] });
  const user = await User.findOne({ email: req.user.email });
  return res.status(200).json({ user: user });
};



module.exports = {
  login,
  signup,
  logout,
  me,
};
