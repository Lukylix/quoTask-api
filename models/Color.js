const mongoose = require("mongoose");

exports.schema = mongoose.Schema({
	name: String,
	hex: {
		type: String,
		required: true,
	},
	isInherit: {
		type: Boolean,
		default: true,
	},
});

exports.model = mongoose.model("Color", exports.schema);
