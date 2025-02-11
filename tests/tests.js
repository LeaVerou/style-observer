export default [
	{
		name: "Animatable built-in",
		arg: {
			property: "opacity",
			value: "0.5",
		},
		expect: "0.5",
	},
	{
		name: "Discrete built-in",
		arg: {
			property: "text-align",
			value: "center",
		},
		expect: "center",
	},
	{
		name: "Not registered custom property",
		arg: {
			property: "--not-registered",
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
			value: "1turn",
		},
		expect: "360deg",
	},
];
