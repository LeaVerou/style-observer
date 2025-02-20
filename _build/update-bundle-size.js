import { build } from "esbuild";
import { gzipSync } from "zlib";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

try {
	console.log("Building bundle...");
	let bundle = await build({
		entryPoints: ["index.js"],
		bundle: true,
		minify: true,
		format: "esm",
		write: false, // Don't write to disk
	});

	console.log("Measuring gzipped size...");
	bundle = bundle.outputFiles[0].contents;
	let size = (gzipSync(bundle).length / 1024).toFixed(1); // in kB

	console.log("Updating README.md...");
	let path = resolve(dirname(fileURLToPath(import.meta.url)), "../README.md");
	let readme = readFileSync(path, "utf8");
	readme = readme.replace(/(?<=\/badge\/gzip-)[\d.]+/, size);

	writeFileSync(path, readme);
	console.log(`Successfully updated bundle size to ${size}kB`);
}
catch (e) {
	console.error("Error updating bundle size:", e);
	process.exit(1);
}
