const mongoose = require("mongoose");

const WorkspaceSchema = require("./Workspace").schema;

exports.schema = mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		// Need setter for lower case
		email: {
			type: String,
			required: true,
			unique: true,
			set: (v) => v.toLowerCase(),
		},
		password: {
			type: String,
			required: true,
			//Prévent Hash password from behing visible in querries
			select: false,
		},
		//We doesnt need default we will do the midleware inside the controller
		workspace: {
			type: WorkspaceSchema,
			required: true,
		},
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	}
);

exports.model = mongoose.model("User", exports.schema);
