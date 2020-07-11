const mongoose = require("mongoose");

const TaskSchema = require("./Task").schema;
const ProjectSchema = require("./Project").schema;
const CategorySchema = require("./Category").schema;

exports.schema = mongoose.Schema({
	categories: [CategorySchema],
	projects: [ProjectSchema],
	tasks: [TaskSchema],
});

exports.model = mongoose.model("Workspace", exports.schema);
