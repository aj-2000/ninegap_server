const express = require("express");
const passport = require("passport");
const { check, validationResult } = require("express-validator");

const { login, logout, signup, me } = require("../controller/AuthController");

const router = express.Router();

// /api/auth/signup
router.post(
  "/signup",
  [
    check("firstName")
      .isLength({ min: 3 })
      .withMessage("the firstName must have minimum length of 3")
      .trim(),
    check("lastName")
      .isLength({ min: 3 })
      .withMessage("the lastName must have minimum length of 3")
      .trim(),

    check("email")
      .isEmail()
      .withMessage("invalid email address")
      .normalizeEmail(),

    check("password")
      .isLength({ min: 8, max: 15 })
      .withMessage("your password should have min and max length between 8-15")
      .matches(/\d/)
      .withMessage("your password should have at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("your password should have at least one sepcial character"),

    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("confirm password does not match");
      }
      return true;
    }),
  ],
  (req, res, next) => {
    const error = validationResult(req).formatWith(({ msg }) => msg);

    const hasError = !error.isEmpty();

    if (hasError) {
      res.status(422).json({ error: error.array() });
    } else {
      next();
    }
  },
  signup
);

// /api/auth/login
router.post(
  "/login",
  passport.authenticate("local", {
    failureMessage: "Invalid username or password",
  }),
  login
);

// /api/auth/logout
router.get("/logout", logout);

// /api/auth/me
router.get("/me", me);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/sign-in",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    // successRedirect: "http://localhost:5173/dashboard",
    // failureRedirect: "http://localhost:5173/sign-up",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}
module.exports = router;
