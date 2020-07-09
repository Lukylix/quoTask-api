const mongoose = require("mongoose");

const TaskSchema = require("./Task").schema;
const ProjectSchema = require("./Project").schema;
const CategorySchema = require("./Category").schema;

exports.schema = mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
			default: false,
		},
		// Need setter for lower case
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			//Prévent Hash password from behing visible in querries
			select: false,
		},
		workspace: {
			type: {
				categories: [CategorySchema],
				projects: [ProjectSchema],
				tasks: [TaskSchema],
      },
      required: true,
			default: {},
		},
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	}
);

exports.model = mongoose.model("User", exports.schema);
