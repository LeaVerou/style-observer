let tests = await Promise.all([
	"constructor",
	"basic",
	"multiple",
	"shadow",
	"nested",
	"display",
	"syntax",
	"records",
].map(name => import(`./${name}.js`).then(module => module.default)));


export default {
	name: "All StyleObserver tests",
	tests,
};
