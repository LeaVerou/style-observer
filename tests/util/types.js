const types = {
	any: {
		syntax: "*",
		initialValue: "0",
		values: ["foo", "42"],
	},

	integer: {
		initialValue: "0",
		values: ["42", "-42"],
		property: "z-index",
	},

	number: {
		initialValue: "0",
		values: ["42", "42.42", "-0.1", "calc(infinity)"],
		property: "opacity",
	},

	length: {
		initialValue: "0px",
		values: ["42px", "-42px"],
		property: "width",
	},

	percentage: {
		initialValue: "0%",
		values: ["42%", "-42%"],
		property: "opacity", // actually <number> | <percentage> but there is no property that only does <percentage>
	},

	"length-percentage": {
		initialValue: "0%",
		values: ["42px", "-42px", "42%", "-42%"],
		property: "width",
	},

	color: {
		initialValue: "rgba(0, 0, 0, 0)",
		values: ["rgb(0, 0, 0)", "hsl(0, 100%, 50%)"],
		property: "color",
	},

	angle: {
		initialValue: "0deg",
		values: ["0.5turn", "360deg"],
		property: "rotate",
	},

	resolution: {
		initialValue: "96dpi",
		values: ["42dppx", "42dpi"],
		property: "image-resolution",
	},

	time: {
		initialValue: "0s",
		values: ["42s", "42ms"],
	},

	string: {
		initialValue: "''",
		values: [`"foo"`, `'bar'`],
		property: "content",
	},

	url: {
		initialValue: "url(https://observe.style/)",
		values: [`url("https://lea.verou.me/")`, `url('https://d12n.me/')`],
		property: "background-image",
	},

	image: {
		initialValue: "linear-gradient(transparent, transparent)",
		values: ["radial-gradient(transparent, black)"],
		property: "background-image",
	},

	"transform-function": {
		initialValue: "scale(1)",
		values: ["scale(0)", "rotate(0deg)"],
		property: "transform",
	},

	"transform-list": {
		initialValue: "scale(1) rotate(0deg)",
		values: ["matrix(1, 0, 1, 1, 0, 0)", "scale(0) rotate(0deg)"],
		property: "transform",
	},

	"custom-ident": {
		initialValue: "foo",
		values: ["--foo", "bar"],
		property: "font-family",
	},

	keywords: {
		syntax: "collapse | separate",
		initialValue: "separate",
		values: ["collapse"],
		property: "border-collapse",
	},
};

for (let id in types) {
	let meta = types[id];
	meta.id = id;
	meta.syntax = meta.syntax ?? `<${id}>`;
}

export default types;

export function registerProperties ({ globalThis = globalThis }) {
	for (let id in types) {
		let meta = types[id];
		for (let inherits of [true, false]) {
			registerProperty({ globalThis, meta, inherits });
		}
	}
}

export function registerProperty ({ globalThis = globalThis, meta, inherits }) {
	try {
		globalThis.CSS.registerProperty({
			name: `--registered-${meta.id}` + (inherits ? "" : "-non-inherited"),
			syntax: meta.syntax,
			inherits,
			initialValue: meta.initialValue,
		});
	}
	catch (e) {
		return e;
	}
}
