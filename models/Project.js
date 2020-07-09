const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ColorSchema = require("./Task").schema;
const TaskSchema = require("./Task").schema;

//Need endedAt
//and modules discrimators
exports.schema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		isDone: {
			type: Boolean,
			default: false,
		},
		treeLevel: {
			type: Number,
			default: 0,
		},
		color: ColorSchema,
		subProjects: [this],
		tasks: [TaskSchema],
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	}
);

exports.model = mongoose.model("Project", exports.schema);
