var Level = require("../models/level")();
var jwt = require("jwt-simple");

var User = require("../models/user");

module.exports = function (app, passport) {
  

  //tested
  app.post(
    "/score",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      if (req.user) {
        //if valid login
        Level.setLeader(
          req.body.levelIndex,
          req.body.score,
          req.user.username,
          function (err, leaderData) {
            res.json(leaderData);
          }
        );
      } else {
        res.json({
          success: false,
          msg: "Authentication failed. User not found.",
        });
      }
    }
  );

  //tested
  //gets the current leader
  app.post("/level", function (req, res) {
    Level.getLeader(req.body.levelIndex, function (err, data) {
      if (!err) {
        res.json(data);
        app.locals.leader = data.name;
      }
    });
  });

  // route to test if the user is logged in or not
  app.get("/loggedin", function (req, res) {
    res.send(req.isAuthenticated() ? req.user : "0");
  });

  getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(" ");
      if (parted.length == 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  app.post("/login", function (req, res) {
    User.findOne({ username: req.body.username }, function (err, user) {
      if (err) throw err;

      if (!user) {
        res.send({
          success: false,
          msg: "Authentication failed. User not found.",
        });
      } else {
        if (user.validPassword(req.body.password)) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, "johnjones");
          // return the information including token as JSON
          res.json({ success: true, token: "JWT " + token });
        } else {
          res.send({
            success: false,
            msg: "Authentication failed. Wrong password.",
          });
        }
      }
    });
  });

  app.post("/register", function (req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({
        success: false,
        msg: "The username and/or password is invalid",
      });
    } else {
      var userData = {
        username: req.body.username,
        password: req.body.password,
      };

      var newUser = new User();
      newUser.username = req.body.username;
      newUser.password = req.body.password;

      newUser.save(function (err) {
        if (err) {
          res.json({
            success: false,
            msg: "Username already taken or database write error",
          });
        } else {
          var token = jwt.encode(newUser, "johnjones");
          res.json({ success: true, token: "JWT " + token });
        }
      });
    }
  });

  //tested
  app.get(
    "/leaderProfile",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      var name = app.locals.leader; //req.params.leaderName;
      if (name === undefined)
        throw "Level leader unknown. Make sure the level route is called at least once.";
      User.findOne({ username: name }, function (err, leader) {
        if (err) return err;

        //Store the last vistor username and email in leader
        if (req.user && req.user.username !== name) {
          leader.meta.last_visitor.name = req.user.username;
          leader.meta.last_visitor.email = req.user.meta.email || "No email";
          leader.meta.last_visitor.date = new Date();
          leader.updated_at = new Date();

          User.update({ _id: leader._id }, leader, function (err, data) {
            if (err) throw err;
          });
        }
        leader.password = undefined;
        res.json(leader);
      });
    }
  );

  app.post(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      var token = getToken(req.headers);
      if (token) {
        var decodedUser = jwt.decode(token, "johnjones");
        User.findOne({ username: decodedUser.username }, function (err, user) {
          if (err) {
            res.json({ success: false, msg: "Databse error" });
          } else {
            user.password = undefined;
            res.json(user);
          }
        });
      } else {
        res.json({ success: false, msg: "No token provided" });
      }
    }
  );

  app.post(
    "/editProfile",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      req.user.meta.firstname = req.body.firstname;
      req.user.meta.lastname = req.body.lastname;
      req.user.meta.hobby = req.body.hobby;
      req.user.meta.occupation = req.body.occupation;
      req.user.meta.country = req.body.country;
      req.user.meta.email = req.body.email;

      User.update({ _id: req.user._id }, req.user, function (err, _data) {
        if (err) throw err;
        res.json(_data);
      });
    }
  );

  //tested
  app.get(
    "/logout",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      req.logout();
      res.json({ success: true, msg: "Logged out" });
    }
  );

  //tested
  app.post(
    "/changePassword",
    passport.authenticate("jwt", { session: false }),
    function (req, res) {
      var oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword,
        confirmPassword = req.body.confirmPassword;

      User.findOne({ _id: req.user.id }, function (err, data) {
        if (!err) {
          if (
            req.user.validPassword(oldPassword, data.password) &&
            newPassword === confirmPassword
          ) {
            data.password = req.user.generateHash(newPassword);
            delete data.id;
            User.update({ _id: req.user.id }, data, function (err) {
              if (err) throw err;
              res.json({ username: req.user.username, id: req.user._id });
            });
          } else {
            res.json({});
          }
        }
      });
    }
  );
};
