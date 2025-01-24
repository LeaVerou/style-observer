let tests = await Promise.all([
	"basic",
	"multiple",
	"shadow",
].map(name => import(`./${name}.js`).then(module => module.default)));


export default {
	name: "All StyleObserver tests",
	tests,
};
