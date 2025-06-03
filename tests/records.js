import StyleObserver from "../index.js";
import { wait } from "../src/util.js";
import gentleRegisterProperty from "./util/gentle-register-property.js";
import commonTests from "./tests.js";

const TIMEOUT = 500;

let properties = commonTests.map(test => test.arg.property);
let values = commonTests.map(test => test.arg.value);

export default {
	name: "Number of records",

	beforeAll () {
		gentleRegisterProperty("--registered", { syntax: "<angle>", initialValue: "0deg" });
	},

	beforeEach () {
		this.dummy = document.createElement("div");
		document.body.append(this.dummy);

		this.dummy.style.setProperty("--not-registered", "0");
	},

	run ({ properties = [], values = [], pause, throttle = 0 }) {
		let observer;
		return new Promise(async resolve => {
			let ret = [];
			observer = new StyleObserver(records => {
				ret.push(...records);
			}, { target: this.dummy, properties, throttle });

			// We give the observer TIMEOUT ms to collect records
			setTimeout(() => resolve(ret), TIMEOUT);

			if (this.data.notObserved) {
				this.dummy.style.setProperty("--not-observed", "foo");
			}

			for (let i = 0; i < properties.length; i++) {
				if (pause) {
					await wait(pause);
				}
				this.dummy.style.setProperty(properties[i], values[i]);
			}
		})
		.then(records => records.length)
		.catch(() => "Timed out")
		.finally(() => {
			observer.unobserve();
		});
	},

	afterEach () {
		this.dummy.remove();
	},

	tests: [
		{
			name: "No throttle",
			tests: [
				{
					name: "No records",
					arg: {
						properties: [],
						values: []
					},
					expect: 0
				},
				{
					name: "Single record",
					arg: {
						properties: ["color"],
						values: ["red"]
					},
					expect: 1
				},
				{
					name: "One or two records",
					check (actual, expected) {
						return actual === 1 || actual === 2;
					},
					arg: {
						properties,
						values,
						pause: TIMEOUT / 2.5
					},
					expect: "1 – 2"
				},
				{
					name: "One or two records in reverse",
					check (actual, expected) {
						return actual === 1 || actual === 2;
					},
					arg: {
						properties: [...properties].reverse(),
						values: [...values].reverse(),
						pause: TIMEOUT / 2.5
					},
					expect: "1 – 2"
				},
				{
					name: "Multiple records with no throttle",
					arg: {
						properties,
						values,
					},
					expect: properties.length
				},
				{
					name: "Not observed property",
					data: {
						notObserved: true
					},
					arg: {},
					expect: 0
				},
				{
					name: "Not observed property among observed ones",
					data: {
						notObserved: true
					},
					arg: {
						properties,
						values
					},
					expect: 4
				},
			],
		},
		{
			name: "With throttle",
			tests: [
				{
					name: "Less than timeout",
					arg: {
						properties,
						values,
						throttle: TIMEOUT / properties.length
					},
					expect: properties.length
				},
				{
					name: "Less than timeout but with pause",
					check (actual, expected) {
						return actual > 1 && actual < this.arg.properties.length;
					},
					arg: {
						properties,
						values,
						pause: TIMEOUT / properties.length,
						throttle: TIMEOUT / properties.length
					},
					expect: `2 — ${ properties.length - 1 }`
				},
				{
					name: "Equals to timeout",
					arg: {
						properties,
						values,
						throttle: TIMEOUT
					},
					expect: 0
				},
			],
		},
	],
};
