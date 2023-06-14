const axios = require('axios');
let env = process.env.NODE_ENV || "development";
let appConfig = require("../config/config.json")[env];

module.exports = {
  signup: function (req, res) {
    res.render("signup");
  },

  signin: function (req, res) {
    res.render("signin", {
      loginShowName: appConfig.oauth2.loginShowName,
    });
  },

  dashboard: function (req, res) {
    // let deflated = zlib.deflateSync(req.user.oAuthToken).toString('base64');
    // let inflated = zlib.inflateSync(Buffer.from(deflated, 'base64')).toString();

    res.render("dashboard", {
      email: req.user.email,
      firstName: req.user.firstName,
      id: req.user.id,
      oAuthToken: req.user.oAuthToken,
    });
  },

  logout: function (req, res) {
    req.session.destroy(function (err) {
      if (appConfig.oauth2.logoutURL && req.user) {
        res.redirect(`${appConfig.oauth2.logoutURL}?client_id=${appConfig.oauth2.clientID}&redirect_uri=${req.protocol}://${req.get('host')}`);
      } else {
        res.redirect("/");
      }
    });
  },
};
