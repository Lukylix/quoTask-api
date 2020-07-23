const mongoose = require("mongoose");

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
			// Mark as optional in mongoose doc but wont pick it up
			index: true,
			unique: true,
			set: (v) => v.toLowerCase(),
		},
		password: {
			type: String,
			required: true,
			// Pravent Hash password from behing visible in querries by default
			select: false,
		},
		//We doesnt need default we will do the midleware inside the controller
		workspace: {
			type: mongoose.Schema.ObjectId, 
			ref: 'Workspace',
			required: true,
		},
	},
	{
		//Let moogoose manage timestamps
		timestamps: true,
	}
);

exports.model = mongoose.model("User", exports.schema);
