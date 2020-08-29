const Workspace = require("../models/Workspace").model;
const mongoose = require("mongoose");

// TODO Facultative precise get

exports.createChild = (req, res) => {
	const { childPath, arrayFilters } = prepareQueryOptions(req, res);
	if (!childPath) return; // if prepare fail we wont run a bad query

	return Workspace.updateOne(
		{ _id: req.auth.workspace },
		{
			$push: { [childPath]: req.body },
		},
		{
			arrayFilters,
			omitUndefined: true,
		}
	).then((result) => {
		//Number of document modified
		if (result.nModified > 0)
			return res.status(200).json({
				message: "Child added!",
				result,
			});

		res.status(404).json({
			message: "Not found",
			result,
		});
	});
};

exports.updateChild = (req, res) => {
	const { $setArray, arrayFilters } = prepareQueryOptions(req, res);
	if (!$setArray) return; // if prepare fail we doesn't wont to run a bad query

	return Workspace.updateOne(
		{ _id: req.auth.workspace },
		{
			$set: $setArray,
		},
		{
			arrayFilters,
			omitUndefined: true,
		}
	).then((result) => {
		if (result.nModified > 0)
			return res.status(202).json({
				message: "Child updated!",
				result,
			});

		// Accepted status
		res.status(200).json({
			message: "Nothing to update",
			result,
		});
	});
};

exports.deleteChild = (req, res) => {
	const { childPath, arrayFilters, target_id } = prepareQueryOptions(req, res);
	if (!childPath) return;

	return Workspace.updateOne(
		{ _id: req.auth.workspace },
		{
			$pull: { [childPath]: { _id: mongoose.Types.ObjectId(target_id) } },
		},
		{
			arrayFilters,
			omitUndefined: true,
			multi: false,
		}
	).then((result) => {
		//Number of document modified
		if (result.nModified > 0)
			return res.status(200).json({
				message: "Child deleted",
				result,
			});

		res.status(404).json({
			message: "Not Found",
			result,
		});
	});
};

const dicPathExemples = {
	default: {
		path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
		alternative: "categories[5f16a5e17c284c5c6d9a6f95].tasks[5f16a6adc048c15d3d1889df]",
	},
	create: {
		path: "categories[5f16a5e17c284c5c6d9a6f95].tasks[]",
	},
	update: {
		get path() {
			return this.default.path;
		},
		alternative: "categories[].project[5f16a6adc048c15d3d1889df].color",
	},
};

const dicFailResponses = {
	getPathIds: {
		pathMissing: {
			message: "You must include the target path:",
			exemples: dicPathExemples.default,
		},
		invalidChar: {
			message: "path: Can only contain letters, numbers, dots, and square bracket.",
			exemples: dicPathExemples.default,
		},
		invalidIds: {
			message: "Ids must be 24 char long",
			exemples: dicPathExemples.default,
		},
	},
	validatePathEnding: {
		create: {
			message: "path: Must end with a direct child of an array without it's id",
			exemples: dicPathExemples.create,
		},
		delete: {
			message: "path: Must end with a direct child of an array with it's id",
			exemples: dicPathExemples.default,
		},
	},
	validatePathPrecision: {
		create: {
			message: "path: Must include the id of the first parent inside an array",
			exemples: dicPathExemples.create,
		},
		update: {
			message: "path: Must include the id of deepest parent inside an array",
			exemples: dicPathExemples.update,
		},
	},
};

function prepareQueryOptions(req, res) {
	const arrayIds = getPathIds(req, res);
	if (!arrayIds) return false;

	//Match all ids including "[" and "]" but not empty ones "[]"
	const regexPathId = /\[(?<=\[)([^\[\]]+?)(?=\])\]/g;
	// splitPath = [ 'categories', '$[]', 'tasks', '$' ]
	let splitPath = req.body.path.replace(regexPathId, ".$").replace(/\[\]/g, ".$[]").split(".");

	const operationType = { POST: "create", PUT: "update", DELETE: "delete" }[req.method];

	if (!validatePathPrecision(splitPath, operationType, res)) return false;

	// We remove the last "[]" for create and delete method
	// to ensure the proper arrayFilter and childPath génération
	if (operationType === "create" || operationType === "delete") splitPath.pop();
	let id_index = 0;
	let arrayFilters = [];
	// Output arrayFilters = [{ 'i._id': 5f16a5e17c284c5c6d9a6f95 },{ 'j._id': 5f16a6adc048c15d3d1889df }]
	// Output childPath = categories.$[].tasks.$[j]
	splitPath.forEach((element, index) => {
		if (element === "$") {
			const setSubChar = String.fromCharCode("i".charCodeAt(0) + id_index);
			splitPath[index] = `$[${setSubChar}]`;
			arrayFilters.push({ [`${setSubChar}._id`]: mongoose.Types.ObjectId(arrayIds[id_index]) });
			id_index++;
		}
	});
	const childPath = splitPath.join("."); // Will be used in conjunction with arrayFilters

	delete req.body.path; // We dosn't include the path in your querry
	req.body._id && delete req.body._id; // Let mongoose generate the id

	// In delete or create mode  we doesn't need $setArray
	if (operationType !== "update") return { arrayFilters, childPath, target_id: arrayIds[arrayIds.length - 1] };

	// Prepare a precise $setArrray query option
	// Every property inside need to be targeted precisely
	// Otherwise all the subs entities will be deleted.
	// Also Prevent accidental update by excluding every array potentially inside our request body
	let $setArray = {};
	for (key in req.body) {
		if (!Array.isArray(req.body[key])) $setArray[`${childPath}.${key}`] = req.body[key];
	}
	// Output $setArray = { 'categories.$[i].tasks.$[j].name': 'Appeler Mathilde', etc}
	return { $setArray, arrayFilters };
}

function getPathIds(req, res) {
	if (!("path" in req.body)) {
		res.status(400).json(dicFailResponses.getPathIds.pathMissing);
		return false;
	}

	const regexValidChar = /^([a-zA-Z0-9]|[\[\]\.])+$/;
	if (!req.body.path.match(regexValidChar)) {
		res.status(400).json(dicFailResponses.getPathIds.invalidChar);
		return false;
	}

	// Match only ids doesn't match empty [] (using look behind and front)
	const regexIdExtract = /(?<=\[)([^\[\]]+?)(?=\])/g;
	// arrayIds = ["5f16a5e17c284c5c6d9a6f95", "5f16a6adc048c15d3d1889df"];
	const arrayIds = req.body.path.match(regexIdExtract) || [];

	if (!arrayIds.every((element) => element.length == 24)) {
		res.status(400).json(dicFailResponses.getPathIds.invalidIds);
		return false;
	}

	return arrayIds;
}

function validatePathEnding(splitPath, operationType, res) {
	// We can make atomic updates, path could end with a property (like color)
	if (operationType === "update") return true;

	if (splitPath[splitPath.length - 1] !== { create: "$[]", delete: "$" }[operationType]) {
		res.status(400).json(dicFailResponses.validatePathEnding[operationType]);
		return false;
	}
	return true;
}

function validatePathPrecision(splitPath, operationType, res) {
	if (!validatePathEnding(splitPath, operationType, res)) return false;
	if (operationType == "delete") return true;

	const dicStartIndex = { create: splitPath.length - 2, update: splitPath.length - 1 };
	// Look behind to see if parent array got an id
	let isValidPath = true;
	for (let index = dicStartIndex[operationType]; index > 0; index--) {
		if (splitPath[index] == "$[]") {
			isValidPath = false;
			break;
		} else if (splitPath[index] == "$") break;
	}
	if (!isValidPath) res.status(400).json(dicFailResponses.validatePathPrecision[operationType]);
	return isValidPath;
}
