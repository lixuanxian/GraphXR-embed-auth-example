let authController = require("../controllers/authController.js");
let env = process.env.NODE_ENV || "development";
let appConfig = require("../config/config.json")[env];

const Auth = function (app, passport) {
  app.get(["/signup"], authController.signup);
  app.get(["/signin",'/login'], authController.signin);
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/dashboard",
      failureRedirect: "/signup",
    })
  );
  app.get("/dashboard", isLoggedIn, authController.dashboard);
  app.get("/logout", authController.logout);
  app.post(
    "/signin",
    passport.authenticate("local-signin", {
      successRedirect: "/dashboard",
      failureRedirect: "/signin",
    })
  );
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/signin");
    // res.redirect("/oauth2/login");
  }

  if (appConfig.oauth2) {
    app.all(
      ["/oauth2/login", "/oauth2/login/callback"],
      passport.authenticate("openid-oauth20", {
        scope: appConfig.oauth2.scope.split(",") || [],
        failureRedirect: "/",
        failureFlash: true,
      }),
      function (req, res) {
        res.redirect("/dashboard");
      }
    );
  }
};

module.exports = Auth;
