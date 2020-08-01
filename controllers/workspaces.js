const Workspace = require("../models/Workspace").model;


// Temporarily Disabled (see workspaces route)
exports.getWorkspaces = (req, res) => {
	Workspace.find()
		.then((workspaces) => {
			//Status code 201 (Created)
			res.status(201).json(workspaces);
		})
		.catch((err) => {
			//Status code 500  (Internal Server Error)
			res.status(500).json({
				message: "Internal Server Error",
				err,
			});
		});
};

exports.getWorkspace = (req, res) => {
	Workspace.findById(req.auth.workspace)
		.then((workspace) => {
			if (workspace !== null) return res.status(200).json(workspace).end();
			//Status code 404  (Not Found)
			res.status(404).json({
				message: "Workspace Not Found",
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

exports.deleteWorkspace = (req, res) => {
	Workspace.deleteOne({ _id: req.auth.workspace })
		.then((result) => {
			if (result.deletedCount > 0)
				return res
					.status(200)
					.json({
						message: "Workspace Deleted!",
					})
					.end();
			res.status(404).json({
				message: "Workspace Not Found",
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