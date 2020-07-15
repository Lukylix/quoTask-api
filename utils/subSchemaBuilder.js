const mongoose = require("mongoose");
// TODO : TypeScript typing

// return a mongoose schema with is subSchemas (self reference childs)
const subSchemaBuilder = (definition, options, { propertyName, treeLimit = 3 }) => {
	// FIXME Doesn't respect guidelines we slove a hypotetical miss usage
	if (!(propertyName in definition))
		throw (
			"You must include the Sub Property in your Schema definition \n" +
			`propertyName parameter given: ${propertyName}`
		);

	let curentDefinition = definition;
	// remove the "propertyName" from our current definition
	// (our last child cant have more childrens)
	delete curentDefinition[propertyName];

	// Add all parents on top of our last child (curentDefinition)
	for (let i = 0; i < treeLimit; i++) {
		//Merging definitons (prepare next Schema)
		curentDefinition = {
			...definition,
			...{
				//Replace the "propertyName" of initial definition
				[propertyName]: {
					//Set type to an arrray of previously prepared schema
					type: [mongoose.Schema(curentDefinition, options)],
				},
			},
		};
	}

	return mongoose.Schema(curentDefinition, options);
};
module.exports = subSchemaBuilder;
