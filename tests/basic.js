import StyleObserver from "../src/index.js";
import gentleRegisterProperty from "../src/util/gentle-register-property.js";
import tests from "./tests.js";

export default {
	name: "Basic",

	tests: [
		{
			name: "Observing a single property",

			run ({ property, meta, initial, value }) {
				let dummy = document.createElement("div");
				document.body.append(dummy);

				let observer;
				return new Promise((resolve, reject) => {
					observer = new StyleObserver(records => {
						resolve(records);
					});

					if (meta) {
						gentleRegisterProperty(property, meta);
					}

					if (initial) {
						dummy.style.setProperty(property, initial);
					}

					observer.observe(dummy, property);

					dummy.style.setProperty(property, value);

					// Timeout after 500ms
					setTimeout(() => reject(), 500);
				})
					.catch(_ => {
						return [{ value: "Timed out" }];
					})
					.then(records => records[0].value)
					.finally(() => {
						observer.unobserve(dummy);
						dummy.remove();
					});
			},

			tests
		},
		{
			name: "Different ways of passing targets and properties",

			run () {
				let { target, targets, changes } = this.arg;
				let properties = Object.keys(changes);

				let container = document.createElement("div");
				document.body.append(container);

				if (target) {
					target = Object.assign(document.createElement("div"), { id: target });
					container.append(target);
				}

				targets = (targets ?? []).map(id => {
					let target = Object.assign(document.createElement("div"), { id });
					container.append(target);
					return target;
				});

				let observer;
				let ret = [];
				return new Promise((resolve, reject) => {
					observer = new StyleObserver(records => {
						ret.push(...records);

						// `targets` is mutated in the StyleObserver constructor, so it already includes the target passed via `target`
						if (ret.length === targets.length * properties.length) {
							resolve(ret);
						}
					}, { target, targets, properties });

					for (let t of [target, ...targets].filter(Boolean)) {
						for (let property of properties) {
							t.style.setProperty(property, changes[property]);
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
					container.remove();
				});
			},

			getName () {
				let targetsCount = this.arg.targets?.length ?? 0;
				targetsCount += this.arg.target ? 1 : 0;

				let propertiesCount = Object.keys(this.arg.changes).length;

				return `${targetsCount} target${targetsCount === 1 ? "" : "s"} and ${propertiesCount} propert${propertiesCount === 1 ? "y" : "ies"}`;
			},

			tests: [
				{
					arg: {
						target: "target",
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						target: {
							opacity: "0.5",
						}
					},
				},
				{
					arg: {
						targets: ["target"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						target: {
							opacity: "0.5",
						}
					},
				},
				{
					arg: {
						target: "target",
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						target: {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						}
					},
				},
				{
					arg: {
						targets: ["target"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						target: {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						}
					},
				},
				{
					arg: {
						target: "target-1",
						targets: ["target-2"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						"target-1": {
							opacity: "0.5",
						},
						"target-2": {
							opacity: "0.5",
						}
					},
				},
				{
					arg: {
						target: "target-1",
						targets: ["target-2"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						"target-1": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
						"target-2": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						}
					},
				},
				{
					arg: {
						targets: ["target-1", "target-2"],
						changes: {
							opacity: "0.5",
						},
					},
					expect: {
						"target-1": {
							opacity: "0.5",
						},
						"target-2": {
							opacity: "0.5",
						}
					},
				},
				{
					arg: {
						targets: ["target-1", "target-2"],
						changes: {
							opacity: "0.5",
							color: "red",
						},
					},
					expect: {
						"target-1": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						},
						"target-2": {
							opacity: "0.5",
							color: "rgb(255, 0, 0)",
						}
					},
				},
			],
		}
	],
};
