const mongoose = require("mongoose");
const subSchemaBuilder = require("../utils/subSchemaBuilder");

const ColorSchema = require("./Task").schema;
const TaskSchema = require("./Task").schema;

exports.schema = subSchemaBuilder(
	{
		name: { type: String, required: true },
		isDone: { type: Boolean, default: false },
		color: ColorSchema,
		subProjects: [this], //Overwrited by our custom function
		tasks: [TaskSchema],
	},
	//Let moogoose manage timestamps
	{ timestamps: true },
	//Custom options
	{
		propertyName: "subProjects",
		treeLimit: 3,
	}
);

exports.model = mongoose.model("Project", exports.schema);
