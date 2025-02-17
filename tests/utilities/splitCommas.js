import { splitCommas } from "../../src/util.js";

export default {
	run: splitCommas,
	tests: [
		{
			arg: "a, b, c",
			expect: ["a", "b", "c"],
		},
		{
			arg: "a",
			expect: ["a"],
		},
		{
			arg: "a, b, (c, d), e",
			expect: ["a", "b", "(c, d)", "e"],
		},
	],
};
