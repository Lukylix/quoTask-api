const mongoose = require("mongoose");
const User = require("../models/User").model;
const Workspace = require("../models/Workspace").model;

const defaultWorkspace = require("../configs/UserDefault/workspace");

exports.createUser = (req, res) => {
	//Add Default Workspace if not include in req
	if (!("workspace" in req.body)) req.body.workspace = defaultWorkspace;
	const workspace = new Workspace({ ...req.body.workspace, _id: new mongoose.Types.ObjectId() });

	workspace
		.save()
		.then((workspace) => {
			req.body.workspace_id = workspace._id;
			const user = new User(req.body);
			user
				.save()
				.then((user) => {
					//Status code 201 (Created)
					res.status(201).json({
						message: "User created!",
						user: user,
						workspace: workspace,
					});
				})
				.catch((err) => {
					//Status code 400 (Bad Request)
					res.status(400).json({
						message: "Bad request",
						err,
					});
				});
		})
		.catch((err) => {
			//Status code 400 (Bad Request)
			res.status(400).json({
				message: "Bad request",
				err,
			});
		});
};

exports.getUsers = (req, res) => {
	User.find()
		.then((users) => {
			//Status code 201 (Created)
			res.status(201).json(users);
		})
		.catch((err) => {
			//Status code 500  (Internal Server Error)
			res.status(500).json({
				message: "Internal Server Error",
				err,
			});
		});
};

exports.getUser = (req, res) => {
	User.findById(req.params.id)
		.then((user) => {
			if (user !== null) res.status(200).json(user).end();
			//Status code 404  (Not Found)
			res.status(404).json({
				message: "User Not Found",
			});
		})
		.catch((err) => {
			//Status code 400 (Bad Request)
			res.status(400).json({
				message: "Bad request not valid id",
				err,
			});
		});
};

// TODO Delete the related workspace
exports.deleteUser = (req, res) => {
	User.deleteOne({ _id: req.params.id })
		.then((result) => {
			if (result.deletedCount > 0)
				res
					.status(200)
					.json({
						message: "User Deleted!",
					})
					.end();
			res.status(404).json({
				message: "User Not Found",
			});
		})
		.catch((err) => {
			//Status code 500  (Internal Server Error)
			res.status(500).json({
				message: "Internal Server Error",
				err,
			});
		});
};
exports.updateUser = (req, res) => {
	User.updateOne({ _id: req.params.id }, req.body, { omitUndefined: true })
		.then((result) => {
			//Number of document modified
			if (result.nModified > 0)
				res
					.status(200)
					.json({
						message: "User updated!",
						result,
					})
					.end();
			res.status(404).json({
				message: "User Not Found",
			});
		})
		.catch((err) => {
			//Status code 500  (Internal Server Error)
			res.status(500).json({
				message: "Internal Server Error",
				err,
			});
		});
};