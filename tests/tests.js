export default [
	{
		name: "Interpolable built-in",
		arg: {
			property: "opacity",
			value: "0.5",
		},
		expect: "0.5",
	},
	{
		name: "Discrete built-in",
		arg: {
			property: "display",
			value: "flex",
		},
		expect: "flex",
	},
	{
		name: "Unregistered custom property",
		arg: {
			property: "--unregistered",
			initial: "bar",
			value: "foo",
		},
		expect: "foo",
	},
	{
		name: "Registered custom property",
		arg: {
			property: "--registered",
			meta: {
				syntax: "<angle>",
				initialValue: "0deg",
			},
			initial: "45deg",
			value: "1turn",
		},
		expect: "1turn",
	},
];
