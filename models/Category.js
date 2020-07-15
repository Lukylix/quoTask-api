const mongoose = require("mongoose");

const subSchemaBuilder = require("../utils/subSchemaBuilder");

const ColorSchema = require("./Color").schema;
const ProjectSchema = require("./Project").schema;
const TaskSchema = require("./Task").schema;

exports.schema = subSchemaBuilder(
	{
		name: {
			type: String,
			required: true,
		},
		color: ColorSchema,
		//Overwrited by our custom function
		subCategories: [this],
		projects: [ProjectSchema],
		tasks: [TaskSchema],
	},
	//Mongoose schema options
	{},
	//Custom options
	{
		propertyName: "subCategories",
		treeLimit: 5,
	}
);

exports.model = mongoose.model("Category", exports.schema);
