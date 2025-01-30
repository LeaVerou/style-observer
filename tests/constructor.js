import StyleObserver from "../index.js";

export default {
	name: "Constructor tests",
	tests: [
		{
			name: "Different ways of passing targets and properties",

			beforeEach () {
				this.container = document.createElement("div");
				document.body.append(this.container);

				let { target, targets } = this.arg;
				if (target) {
					this.target = Object.assign(document.createElement("div"), { id: target });
					this.container.append(this.target);
				}

				this.targets = (targets ?? []).map(id => {
					let target = Object.assign(document.createElement("div"), { id });
					this.container.append(target);
					return target;
				});
			},

			run ({ changes }) {
				let properties = Object.keys(changes);
				let { target, targets } = this;
				let observer, ret = [];

				return new Promise((resolve, reject) => {
					observer = new StyleObserver(records => {
						ret.push(...records);

						// We need all the records to be returned before we can resolve
						// `targets` is mutated in the StyleObserver constructor, so it already includes the target passed via `target`
						if (ret.length === targets.length * properties.length) {
							resolve(ret);
						}
					}, { target, targets, properties });

					for (let el of [target, ...targets].filter(Boolean)) {
						for (let property of properties) {
							el.style.setProperty(property, changes[property]);
						}
					}

					// Timeout after 500ms
					setTimeout(() => reject(), 500);
				})
				.then(records => records.reduce((acc, record) => {
					acc[record.target.id] = { ...acc[record.target.id], [record.property]: record.value };
					return acc;
				}, {}))
				.catch(() => "Timed out")
				.finally(() => {
					observer.unobserve();
				});
			},

			afterEach () {
				this.container.remove();
			},

			getName () {
				let targetCount = this.arg.targets?.length ?? 0;
				targetCount += this.arg.target ? 1 : 0;

				let propertyCount = Object.keys(this.arg.changes).length;

				let targetSuffix = targetCount === 1 ? "target" : "targets";
				let propertySuffix = propertyCount === 1 ? "property" : "properties";

				return `${ targetCount } ${ targetSuffix }, ${ propertyCount } ${ propertySuffix }`;
			},

			tests: [
				{
					arg: {
						target: "el",
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						el: {
							opacity: "0.5",
						},
					},
				},
				{
					arg: {
						targets: ["el"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						el: {
							opacity: "0.5",
						},
					},
				},
				{
					arg: {
						target: "el",
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						el: {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
					},
				},
				{
					arg: {
						targets: ["el"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						el: {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
					},
				},
				{
					arg: {
						target: "el-1",
						targets: ["el-2"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						"el-1": {
							opacity: "0.5",
						},
						"el-2": {
							opacity: "0.5",
						},
					},
				},
				{
					arg: {
						target: "el-1",
						targets: ["el-2"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						"el-1": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
						"el-2": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
					},
				},
				{
					arg: {
						targets: ["el-1", "el-2"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						"el-1": {
							opacity: "0.5",
						},
						"el-2": {
							opacity: "0.5",
						},
					},
				},
				{
					arg: {
						targets: ["el-1", "el-2"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						"el-1": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
						"el-2": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
					},
				},
			],
		},
	],
};
