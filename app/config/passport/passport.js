let bCrypt = require("bcryptjs");
let env = process.env.NODE_ENV || "development";
let appConfig = require("../config.json")[env];
const OAuth2Strategy = require('passport-openid-oauth20').Strategy;
const models = require("../../models");

function randomStr(len) {
    let value = "";
    let i = 0;
    let charactors = "ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz$-!_#%";
    for (let j = 1; j <= len; j++) {
        i = parseInt(35 * Math.random());
        value = value + charactors.charAt(i);
    }
    return value;
}

function createUser(
  email,
  password,
  firstName,
  lastName,
  done,
  oAuthToken,
  useExistUser = false
) {
let User = models.user;
  let generateHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
  };
  User.findOne({
    where: {
      email: email,
    },
  }).then(function (user) {
    let userPassword = generateHash(password || randomStr(24));
    let token = oAuthToken ? oAuthToken : randomStr(24);
    let data = {
      email,
      password: userPassword,
      firstName,
      lastName,
      oAuthToken: token,
    };
    if (user) {
      if (useExistUser) {
        return User.update(data, { where: { email } }).then(() => {
            return done(null, Object.assign(user,data));
        });
      }
      return done(null, false, {
        message: "That email is already taken",
      });
    } else {
      User.create(data).then(function (newUser, created) {
        if (!newUser) {
          return done(null, false);
        }
        if (newUser) {
          return done(null, newUser);
        }
      }, (err) =>{
        return done(err);
    });
    }
  });
}

module.exports = function (passport, user) {
  let User = user;
  let LocalStrategy = require("passport-local").Strategy;
  //serialize
  passport.serializeUser(function (user, done) {
    console.log("serializing user: ", user);
    done(null, user.id);
  });
  // deserialize user
  passport.deserializeUser(function (id, done) {
    User.findByPk(id).then(function (user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });
  //LOCAL SIGNUP
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        return createUser(
          email,
          password,
          req.body.firstName,
          req.body.lastName,
          done
        );
      }
    )
  );

  //LOCAL SIGNIN
  passport.use(
    "local-signin",
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },

      function (req, email, password, done) {
        let User = user;
        let isValidPassword = function (userpass, password) {
          return bCrypt.compareSync(password, userpass);
        };

        User.findOne({
          where: {
            email: email,
          },
        })
          .then(function (user) {
            if (!user) {
              return done(null, false, {
                message: "Email does not exist",
              });
            }

            if (!isValidPassword(user.password, password)) {
              return done(null, false, {
                message: "Incorrect password.",
              });
            }

            let userinfo = user.get();
            return done(null, userinfo);
          })
          .catch(function (err) {
            console.log("Error:", err);

            return done(null, false, {
              message: "Something went wrong with your Signin",
            });
          });
      }
    )
  );

  if (appConfig.oauth2) {
    const oauth = new OAuth2Strategy(
      Object.assign(
        {
          passReqToCallback: true,
          callbackURL: "/oauth2/login/callback",
        },
        appConfig.oauth2
      ),
      function (req, accessToken, refreshToken, profile, done) {
        profile = profile._json || profile || {};
        if (!profile.email) {
          return done(new Error("No email found"), null);
        }
        req.query.username = profile.email;
        let oAuthUser = {
          firstName:
            profile.firstName ||
            profile.first_name ||
            profile.given_name ||
            profile.name,
          lastName:
            profile.lastName || 
            profile.last_name || 
            profile.family_name,
          email: profile.email,
          avatarURL:
            profile.picture ||
            profile.photo ||
            profile.avatarURL ||
            profile.avatar ||
            profile.avatar_url,
          accessToken,
        };

        return createUser(
          oAuthUser.email,
          null,
          oAuthUser.firstName,
          oAuthUser.lastName,
          done,
          accessToken,
          true
        );
      }
    );
    oauth._oauth2.useAuthorizationHeaderforGET(true);
    passport.use(oauth);
  }
};
