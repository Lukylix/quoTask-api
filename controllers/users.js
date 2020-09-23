const mongoose = require("mongoose");
const User = require("../models/User").model;
const Workspace = require("../models/Workspace").model;

const defaultWorkspace = require("../configs/UserDefault/workspace");

exports.createUser = (req, res) => {
	//Add Default Workspace if not in req
	if (!("workspace" in req.body)) req.body.workspace = defaultWorkspace;
	const workspace = new Workspace({ ...req.body.workspace, _id: new mongoose.Types.ObjectId() });

	workspace
		.save()
		.then((workspace) => {
			req.body.workspace = workspace._id;
			const user = new User(req.body);
			return user.save();
		})
		.then((user) => {
			res.status(201).json({ message: "User created!", user, workspace });
		})
		.catch((err) => {
			res.status(400).json({ message: "Bad request", err });
		});
};

exports.getUser = (req, res) => {
	User.findById(req.auth._id)
		.then((user) => {
			if (user !== null) return res.status(200).json(user);
			//Status code 404  (Not Found)
			res.status(404).json({
				message: "User Not Found",
			});
		})
		.catch((err) => {
			//Status code 400 (Bad Request)
			res.status(400).json({
				message: "Bad request, invalid id",
				err,
			});
		});
};

// TODO Delete the related workspace
exports.deleteUser = (req, res) => {
	return User.deleteOne({ _id: req.auth._id }).then((result) => {
		if (result.deletedCount > 0)
			return res.status(200).json({
				message: "User Deleted!",
			});
		res.status(404).json({
			message: "User Not Found",
		});
	});
};

exports.updateUser = (req, res) => {
	// Update hook removed we wont update the password this way
	if ("password" in req.body) delete req.body.password;

	// If this line is modified could result in bypass mongoose update hook
	User.updateOne({ _id: req.auth._id }, req.body, { omitUndefined: true }).then((result) => {
		//Number of document modified
		if (result.nModified > 0)
			return res.status(200).json({
				message: "User updated!",
				result,
			});

		res.status(404).json({
			message: "User Not Found",
		});
	});
};
