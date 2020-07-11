//http://materialuicolors.co/
const defaultColors = {
	red: { name: "red", hex: "#F44336" },
	pink: { name: "pink", hex: "#E91E63" },
	purple: { name: "purple", hex: "#9C27B0" },
	deepPurple: { name: "deepPurple", hex: "#673AB7" },
	indigo: { name: "indigo", hex: "#3F51B5" },
	blue: { name: "blue", hex: "#2196F3" },
	lightBlue: { name: "lightBlue", hex: "#03A9F4" },
	cyan: { name: "cyan", hex: "#00BCD4" },
	teal: { name: "teal", hex: "#009688" },
	green: { name: "green", hex: "#4CAF50" },
	lightGreen: { name: "lightGreen", hex: "#8BC34A" },
	lime: { name: "lime", hex: "#CDDC39" },
	yellow: { name: "yellow", hex: "#CDDC39" },
	amber: { name: "amber", hex: "#FFC107" },
	orange: { name: "orange", hex: "#FF9800" },
	deepOrange: { name: "deepOrange", hex: "#FF5722" },
	brown: { name: "brown", hex: "#795548" },
	grey: { name: "grey", hex: "#9E9E9E" },
	blueGrey: { name: "blueGrey", hex: "#607D8B" },
};

const defaultWorkspace = {
	categories: [
		{
			name: "Activités",
			color: defaultColors.purple,
			subCategories: [
				{
					name: "Animaux",
					tasks: [
						{
							name: "Balade de Rufus",
						},
					],
				},
				{
					name: "Musique",
					projects: [
						{
							name: "Aprendre le solfège",
							tasks: [
								{
									name: "Cours en ligne",
								},
								{
									name: "Acheter une guitar",
								},
							],
						},
					],
				},
			],
			tasks: {
				name: "Test",
			},
		},
	],
	projects: [],
	tasks: [
		{
			name: "Appeler Christine",
			subTasks: [
				{
					name: "Sous Tache",
				},
			],
		},
	],
};

module.exports = defaultWorkspace;
