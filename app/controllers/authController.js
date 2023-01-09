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
    let handleLogout = function handleLogout() {
      req.session.destroy(function (err) {
        res.redirect("/");
      });
    };
    if (appConfig.oauth2.logoutURL && req.user) {
      axios.get(appConfig.oauth2.logoutURL, {
          headers: {
            Authorization: `Bearer ${req.user.oAuthToken}`,
          },
        })
        .then(() => {
          handleLogout();
        })
        .catch((err) => {
          handleLogout();
        });
    } else {
      handleLogout();
    }
  },
};
