const passport = require("passport");
const LocalStrategy = require("passport-local");
const {
  FB_CLIENT_ID,
  FB_CLIENT_SECRET,
  FB_CALLBACK_URL,
} = require("../config");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

const addGoogleUser = ({
  id,
  email,
  firstName,
  lastName,
  profilePhoto,
  source,
}) => {
  const user = new User({
    id,
    email,
    firstName,
    lastName,
    profilePhoto,
    source,
    password: "",
  });
  return user.save();
};

const getUsers = () => {
  return User.find({});
};

const getUserByEmail = async ({ email }) => {
  return await User.findOne({ email });
};

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) return done(null, false);

        const passwordMatch = await user.comparePassword(password);

        if (!passwordMatch) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const id = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePhoto = profile.photos[0].value;
      const source = "google";

      const currentUser = await getUserByEmail({ email });
      if (!currentUser) {
        const newUser = await addGoogleUser({
          id,
          email,
          firstName,
          lastName,
          profilePhoto,
          source,
        });
        return done(null, newUser);
      }

      if (currentUser.source != "google") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }

      currentUser.lastVisited = new Date();
      return done(null, currentUser);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FB_CLIENT_ID,
      clientSecret: FB_CLIENT_SECRET,
      callbackURL: FB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const id = profile.id;
      const email = `${profile.id}@facebook.com`;
      const firstName = profile.displayName.split(" ")[0];
      const lastName = profile.displayName.split(" ")[1];
      const profilePhoto = profile.photos
        ? profile.photos.value
        : "https://www.marismith.com/wp-content/uploads/2014/07/facebook-profile-blank-face.jpeg";
      const source = "facebook";

      const currentUser = await getUserByEmail({ email });
      if (!currentUser) {
        const newUser = await addGoogleUser({
          id,
          email,
          firstName,
          lastName,
          profilePhoto,
          source,
        });
        return done(null, newUser);
      }

      if (currentUser.source != "facebook") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }

      currentUser.lastVisited = new Date();
      return done(null, currentUser);
    }
  )
);

module.exports = passport;
