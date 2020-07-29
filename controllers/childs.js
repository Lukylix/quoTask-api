const Workspace = require("../models/Workspace").model;
const mongoose = require("mongoose");
// TODO Facultative precise get

exports.createChild = (req, res) => {
	const { childPath, arrayFilters, target_id } = preparePath(req, res);
	// if prepare fail we doesn't wont to run a bad querry
	if (!childPath) return;

	delete req.body.path;
	Workspace.updateOne(
		{ _id: req.params.workspace_id },
		{
			$push: { [childPath]: { ...req.body, _id: target_id } },
		},
		{
			arrayFilters: arrayFilters,
			omitUndefined: true,
		},
		(err, result) => {
			if (err) {
				//Status code 500  (Internal Server Error)
				res.status(500).json({
					message: "Internal Server Error",
					err,
				});
				//Number of document modified
			} else if (result.nModified > 0) {
				res.status(200).json({
					message: "Child added!",
					result,
				});
			} else {
				res.status(404).json({
					message: "Not found",
					result: result,
				});
			}
		}
	);
};

exports.updateChild = (req, res) => {
	const { $setArray, arrayFilters } = preparePath(req, res);
	// if prepare fail we doesn't wont to run a bad querry
	if (!$setArray) return;
	Workspace.updateOne(
		{ _id: req.params.workspace_id },
		{
			$set: $setArray,
		},
		{
			arrayFilters: arrayFilters,
			omitUndefined: true,
		},
		(err, result) => {
			if (err) {
				//Status code 500  (Internal Server Error)
				res.status(500).json({
					message: "Internal Server Error",
					err,
				});
				//Number of document modified
			} else if (result.nModified > 0) {
				res.status(200).json({
					message: "Child updated!",
					result,
				});
			} else {
				// Accepted 
				res.status(200).json({
					message: "Nothing to update",
					result
				});
			}
		}
	);
};

exports.deleteChild = (req, res) => {
	const { childPath, arrayFilters, target_id } = preparePath(req, res);
	if (!childPath) return;
	Workspace.updateOne(
		{ _id: req.params.workspace_id },
		{
			$pull: { [childPath]: { _id: mongoose.Types.ObjectId(target_id) } },
		},
		{
			arrayFilters: arrayFilters,
			omitUndefined: true,
			multi: false,
		},
		(err, result) => {
			if (err) {
				//Status code 500  (Internal Server Error)
				res.status(500).json({
					message: "Internal Server Error",
					err,
				});
				//Number of document modified
			} else if (result.nModified > 0) {
				res.status(200).json({
					message: "Child deleted",
					result,
				});
			} else {
				res.status(404).json({
					message: "Not Found",
					result: result,
				});
			}
		}
	);
};

function preparePath(req, res) {
	const arrayIds = getPathIds(req, res);
	let operationType;
	switch (req.method) {
		case "POST":
			operationType = "create";
			break;
		case "DELETE":
			operationType = "delete";
			break;
		case "PUT":
			operationType = "update";
			break;
	}
	if (!arrayIds) return false;

	//Match all ids including "[" and "]" but not empty ones "[]"
	const regexPathId = /\[(?<=\[)([^\[\]]+?)(?=\])\]/g;
	// splitPath = [ 'categories', '$[]', 'tasks', '$' ]
	let splitPath = req.body.path.replace(regexPathId, ".$").replace(/\[\]/g, ".$[]").split(".");

	if (operationType == "delete" && splitPath[splitPath.length - 1] !== "$") {
		res.status(400).json({
			message: "path must end with a direct child of an array with id",
			exemples: {
				path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
				alternative: "categories[5f16a5e17c284c5c6d9a6f95].tasks[5f16a6adc048c15d3d1889df]",
			},
		});
		return false;
	}
	if (operationType == "create") {
		if (splitPath[splitPath.length - 1] !== "$[]") {
			res.status(400).json({
				message: "path must end with a direct child of an array without id",
				exemples: {
					path: "categories[5f16a5e17c284c5c6d9a6f95].tasks[]",
				},
			});
			return false;
		}
	}
	if (operationType != "delete") {
		// Look behind to see if parent array got an id
		let isValidPath = true;
		for (let index = splitPath.length - (operationType == "create" ? 2 : 1); index > 0; index--) {
			if (splitPath[index] == "$[]") {
				isValidPath = false;
				break;
			} else if (splitPath[index] == "$") break;
		}
		if (!isValidPath) {
			res.status(400).json({
				message:
					"path: must include the " +
					(operationType == "create" ? "id of the first parent inside an array" : "last id"),
				exemples: {
					path:
						operationType == "create"
							? "categories[5f16a5e17c284c5c6d9a6f95].tasks[]"
							: "categories[].tasks[5f16a5e17c284c5c6d9a6f95]",
				},
			});
			return false;
		}
	}

	// Remove the last element ($pull or $push need to point to an array)
	if (operationType !== "update") splitPath.pop();

	let id_index = 0;
	let arrayFilters = [];
	// Output arrayFilters = [{ 'i._id': 5f16a5e17c284c5c6d9a6f95 },{ 'j._id': 5f16a6adc048c15d3d1889df }]
	// Outpu childPath = categories.$[].tasks.$[j]
	splitPath.forEach((element, index) => {
		if (element === "$") {
			const setSubChar = String.fromCharCode("i".charCodeAt(0) + id_index);
			splitPath[index] = `$[${setSubChar}]`;
			arrayFilters.push({ [`${setSubChar}._id`]: mongoose.Types.ObjectId(arrayIds[id_index]) });
			id_index++;
		}
	});
	const childPath = splitPath.join(".");

	// In delete mode we doesn't need $setArray
	if (operationType != "update")
		return {
			arrayFilters: arrayFilters,
			childPath: childPath,
			target_id: arrayIds[arrayIds.length - 1],
		};

	delete req.body.path;
	delete req.body._id;
	// Prepare a precise path for $set $pull ect
	// Prevent accidental update by removing every array inside our request body
	// Output $setArray = { 'categories.$[i].tasks.$[j].name': 'Appeler Mathilde',}
	let $setArray = {};
	for (key in req.body)
		if (!Array.isArray(req.body[key])) $setArray[`${childPath}.${key}`] = req.body[key];

	return { $setArray: $setArray, arrayFilters: arrayFilters };
}

function getPathIds(req, res) {
	if (!("path" in req.body)) {
		res.status(400).json({
			message: "your must include path:",
			exemples: {
				path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
				alternative: "categories[5f16a5e17c284c5c6d9a6f95].tasks[5f16a6adc048c15d3d1889df]",
			},
		});
		return false;
	}
	const regexValidChar = /^([a-zA-Z0-9]|[\[\]\.])+$/;
	if (!req.body.path.match(regexValidChar)) {
		res.status(400).json({
			message:
				"Bad request, path: can only contain letters, number, dots, and square bracket",
			exemples: {
				path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
			},
		});
		return false;
	}

	// Match only ids doesn't match empty [] (using look behind and front)
	const regexIdExtract = /(?<=\[)([^\[\]]+?)(?=\])/g;
	// arrayIds = ["5f16a5e17c284c5c6d9a6f95", "5f16a6adc048c15d3d1889df"];

	const arrayIds = req.body.path.match(regexIdExtract) || [];

	if (!arrayIds.every((element) => element.length == 24)) {
		//Status code 400 (Bad Request)
		res.status(400).json({ message: "Bad request, ids must be a 24 char string" });
		return false;
	}

	return arrayIds;
}
