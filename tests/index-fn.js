let tests = await Promise.all([
	"basic",
].map(name => import(`./${name}.js`).then(module => module.default)));


export default {
	name: "All StyleObserver tests",
	tests,
};
