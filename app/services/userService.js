let Users = require('../db/models/users'),
	Files = require('../db/models/files');

let jwt = require('jsonwebtoken'),
	mongoose = require('mongoose'),
	Promise = require('bluebird');

mongoose.Promise = Promise;

module.exports.signup = function(req, res) {
	let user = new Users();

	user.email = req.body.email;
	user.password = req.body.password;
	user.firstName = req.body.fname;
	user.lastName = req.body.lname;
	user.joinDate = new Date();

	user.save(function(err) {
		if(err){
			if(err.name === 'MongoError' && err.code === 11000) {
				return res.status(200).send({"msg":"Account exists!"});
			}
			else {
				console.log(err.message);
				return res.status(500).send({"msg": "Internal error!"});
			}
		}
		else {
			res.status(200).send({"msg": "Successfully joined."});
		}
	});
}

module.exports.login = function(req, res) {
	if (req.body.email !== undefined && req.body.password !== undefined) {
		Users.find({email: req.body.email}, function(err, users) {
			if(users.length === 1) {
				if (users[0].password === req.body.password) {
					var response = {user: users[0].toJSON()};
					var token = jwt.sign(response,process.env.SECRET);
					response.token = token;
					delete response.user;
					res.status(200).send(response);
				}
				else {
					res.status(401).send({"msg": "The password doesn't match."});
				}
			}
			else {
				res.status(401).send({"msg": "The email doesn't exist in our records."});
			}
		})
	}
}

module.exports.getFiles = function(uid) {
	return new Promise(function(resolve, reject) {
		let promise = Files.find({ userId: uid }).exec();
		promise.then(function(files) {
			resolve(files);
		});
	});
}