const Workspace = require("../models/Workspace").model;
const mongoose = require("mongoose");
// TODO Facultative precise get

exports.createChild = (req, res) => {
	const { childPath, arrayFilters, target_id } = preparePath(req, res);
	// if prepare fail we doesn't wont to run a bad querry
	if (!childPath) return;

	delete req.body.path;
	return Workspace.updateOne(
		{ _id: req.auth.workspace },
		{
			$push: { [childPath]: { ...req.body, _id: target_id } },
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
	const { $setArray, arrayFilters } = preparePath(req, res);
	// if prepare fail we doesn't wont to run a bad querry
	if (!$setArray) return;
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

		// Accepted
		res.status(200).json({
			message: "Nothing to update",
			result,
		});
	});
};

exports.deleteChild = (req, res) => {
	const { childPath, arrayFilters, target_id } = preparePath(req, res);
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

function preparePath(req, res) {
	const arrayIds = getPathIds(req, res);
	if (!arrayIds) return false;

	const dicReqType = { POST: "create", PUT: "update", DELETE: "delete" };
	const operationType = dicReqType[req.method];

	//Match all ids including "[" and "]" but not empty ones "[]"
	const regexPathId = /\[(?<=\[)([^\[\]]+?)(?=\])\]/g;
	// splitPath = [ 'categories', '$[]', 'tasks', '$' ]
	let splitPath = req.body.path.replace(regexPathId, ".$").replace(/\[\]/g, ".$[]").split(".");

	// TODO Async functions Promise.all
	switch (operationType) {
		case "create":
			if (!validatePathPrecision(splitPath, operationType, res)) return false;
		case "delete":
			if (!validatePathEnding(splitPath, operationType, res)) return false;
			splitPath.pop();
			break;
		case "update":
			if (!validatePathPrecision(splitPath, operationType, res)) return false;
			break;
	}

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
			arrayFilters,
			childPath,
			target_id: arrayIds[arrayIds.length - 1],
		};

	// Prepare a precise path for $set $pull ect
	// Prevent accidental update by removing every array inside our request body
	// Output $setArray = { 'categories.$[i].tasks.$[j].name': 'Appeler Mathilde',}
	delete req.body.path;
	delete req.body._id;
	let $setArray = {};
	for (key in req.body) if (!Array.isArray(req.body[key])) $setArray[`${childPath}.${key}`] = req.body[key];

	return { $setArray, arrayFilters };
}

function getPathIds(req, res) {
	if (!("path" in req.body)) {
		res.status(400).json({
			message: "you must include path:",
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
			message: "path: can only contain letters, numbers, dots, and square bracket",
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

function validatePathEnding(splitPath, operationType, res) {
	const dicFailResponses = {
		create: {
			message: "path must end with a direct child of an array without id",
			exemple: {
				path: "categories[5f16a5e17c284c5c6d9a6f95].tasks[]",
			},
		},
		delete: {
			message: "path must end with a direct child of an array with id",
			exemple: {
				path: "categories[].tasks[5f16a6adc048c15d3d1889df]",
				alternative: "categories[5f16a5e17c284c5c6d9a6f95].tasks[5f16a6adc048c15d3d1889df]",
			},
		},
	};
	const dicLastCharMatch = { create: "$[]", delete: "$" };
	if (splitPath[splitPath.length - 1] !== dicLastCharMatch[operationType]) {
		res.status(400).json(dicFailResponses[operationType]);
		return false;
	}
	return true;
}

function validatePathPrecision(splitPath, operationType, res) {
	const dicFailResponses = {
		create: {
			message: "path: must include the id of the first parent inside an array",
			exemple: {
				path: "categories[5f16a5e17c284c5c6d9a6f95].tasks[]",
			},
		},
		update: {
			message: "path: must include the last id",
			exemple: {
				path: "categories[].tasks[5f16a5e17c284c5c6d9a6f95]",
			},
		},
	};

	const dicStartIndex = {
		create: splitPath.length - 2,
		update: splitPath.length - 1,
	};

	// Look behind to see if parent array got an id
	let isValidPath = true;
	for (let index = dicStartIndex[operationType]; index > 0; index--) {
		if (splitPath[index] == "$[]") {
			isValidPath = false;
			break;
		} else if (splitPath[index] == "$") break;
	}
	if (!isValidPath) res.status(400).json(dicFailResponses[operationType]);
	return isValidPath;
}
