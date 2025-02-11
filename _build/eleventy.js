import markdownItAnchor from "markdown-it-anchor";

export default config => {
	let data = {
		layout: "page.njk",
		permalink: "{{ 'index' if page.filePathStem == '/README' else page.filePathStem }}.html",
	};

	for (let p in data) {
		config.addGlobalData(p, data[p]);
	}

	config.amendLibrary("md", md => {
		md.options.typographer = true;
		md.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.headerLink(),
			level: 2,
		});
	});

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			includes: "_build/includes",
			output: "."
		},
	};
};
