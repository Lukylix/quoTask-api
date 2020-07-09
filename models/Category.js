const mongoose = require("mongoose");

const ColorSchema = require("./Color").schema;
const ProjectSchema = require("./Project").schema;
const TaskSchema = require("./Task").schema;

exports.schema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	treeLevel: {
		type: Number,
		default: 0,
	},
	color: {
		type: ColorSchema,
	},
	subCategories: this,
	projects: [ProjectSchema],
	tasks: [TaskSchema],
});

exports.model = mongoose.model("Category", exports.schema);