
var JwtStrategy = require('passport-jwt').Strategy;
var User = require("../models/user")

module.exports = function(passport){
	var opts = {};
	//opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
	opts.secretOrKey = "johnjones";
	passport.use(new JwtStrategy(opts, function(jwt_payload, done){
		User.findOne({username: jwt_payload.username}, function(err, user){
			if (err) {
				return done(err, false);
			}
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
				// or you could create a new account
			}
		});
	}))
} 
