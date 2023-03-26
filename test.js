const t1 = require("./1.json");
const t2 = require("./2.json");

const elementsMissingInT2 = t1.filter(x => t2.indexOf(x) === -1);
console.log("elementsMissingInT2", elementsMissingInT2);

const elementsMissingInT1 = t2.filter(x => t1.indexOf(x) === -1);
console.log("elementsMissingInT1", elementsMissingInT1);