const Workspace = require("../models/Workspace").model;
const mongoose = require("mongoose");

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
				res.status(404).json({
					message: "Nothing to update",
					result: result,
				});
			}
		}
	);
};

function preparePath(req, res) {
	const arrayIds = getPathIds(req, res);
	if (!arrayIds) return false;

	//Match all ids including "[" and "]" but not empty ones "[]"
	const regexPathId = /\[(?<=\[)([^\[\]]+?)(?=\])\]/g;
	// splitPath = [ 'categories', '$[]', 'tasks', '$' ]
	const splitPath = req.body.path.replace(regexPathId, ".$").replace(/\[\]/g, ".$[]").split(".");

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

	delete req.body.path;
	delete req.body._id;
	// Prepare a precise path for $set $pull ect
	// Prevent accidental update by removing every array inside our request body
	// Output $setArray = { 'categories.$[i].tasks.$[j].name': 'Appeler Mathilde',}
	let $setArray = {};
	for (key in req.body)
		if (!Array.isArray(req.body[key])) $setArray[`${childPath}.${key}`] = req.body[key];

	return { $setArray: $setArray, arrayFilters: arrayFilters, childPath: childPath };
}

function getPathIds(req, res) {
	if (!("path" in req.body)) {
		res.status(400).json({
			message: "your must include path",
			exemples: {
				path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
				alternative: "categories[5f16a5e17c284c5c6d9a6f95].tasks[5f16a6adc048c15d3d1889df]",
			},
		});
		return false;
	}

	// Match only ids doesn't match empty [] (using look behind and front)
	const regexIdExtract = /(?<=\[)([^\[\]]+?)(?=\])/g;
	// arrayIds = ["5f16a5e17c284c5c6d9a6f95", "5f16a6adc048c15d3d1889df"];
	const arrayIds = req.body.path.match(regexIdExtract);

	if (!arrayIds.every((element) => element.length == 24)) {
		//Status code 400 (Bad Request)
		res.status(400).json({ message: "Bad request, ids must be a 24 char string" });
		return false;
	}

	return arrayIds;
}
