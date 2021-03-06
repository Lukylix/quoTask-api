const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// TODO Email verification
const userShema = new mongoose.Schema(
	{
		firstname: { type: String, required: true },
		lastname: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
			index: true, // Mark as optional in mongoose doc but wont pick it up
			set: (v) => v.toLowerCase().trim(),
		},
		password: {
			type: String,
			required: true,
			select: false, // Prevent Hash password from behing visible in querries by default
		},
		//We doesn't need default we will do the midleware inside the controller
		workspace: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Workspace",
			required: true,
		},
	},
	//Let moogoose manage timestamps
	{ timestamps: true }
);

//Must not use arrow function so this keyword can be bound
userShema.pre("save", function (next) {
	let user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified("password")) return next();

	// hash the password using our new salt
	bcrypt.hash(user.password, 10, (err, hash) => {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});

// Must not use arrow function so we can use this keyword
userShema.methods.verifyPassword = function (plainPassword, callBack) {
	bcrypt.compare(plainPassword, this.password, (err, isValid) => {
		if (err) return callBack(err);
		callBack(null, isValid);
	});
};

exports.schema = userShema;
exports.model = mongoose.model("User", exports.schema);
