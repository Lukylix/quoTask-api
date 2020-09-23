const mongoose = require("mongoose");

const subSchemaBuilder = require("../utils/subSchemaBuilder");

const ColorSchema = require("./Color").schema;
const ProjectSchema = require("./Project").schema;
const TaskSchema = require("./Task").schema;

exports.schema = subSchemaBuilder(
	{
		name: { type: String, required: true },
		color: ColorSchema,
		subCategories: [this], //Overwritten by our  function
		projects: [ProjectSchema],
		tasks: [TaskSchema],
	},
	{}, //Mongoose schema options
	{ propertyName: "subCategories", treeLimit: 5 } //Options for subSchemaBuilder()
);

exports.model = mongoose.model("Category", exports.schema);