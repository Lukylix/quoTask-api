const mongoose = require("mongoose");
const subSchemaBuilder = require("../utils/subSchemaBuilder");
// TODO  endedAt / doneAt
exports.schema = subSchemaBuilder(
	{
		name: {
			type: String,
			required: true,
		},
		isDone: {
			type: Boolean,
			default: false,
		},
		//Overwrited by our custom function
		subTasks: [this],
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	},
	//Custom options
	{
		propertyName: "subTasks",
		treeLimit: 3,
	}
);

exports.model = mongoose.model("Task", exports.schema);
