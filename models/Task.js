const mongoose = require("mongoose");

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
		subTasks: [this],
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	}
);

exports.model = mongoose.model("Task", exports.schema);
