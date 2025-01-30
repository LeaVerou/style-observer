export default config => {
	let data = {
		layout: "page.njk",
		permalink: "{{ 'index' if page.filePathStem == '/README' else page.filePathStem }}.html",
	};

	for (let p in data) {
		config.addGlobalData(p, data[p]);
	}

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			includes: "_build/includes",
			output: "."
		},
	};
};
