const test = require("./test.json");

console.log(test.length);

for (let i = 0; i < test.length; i++) {
  console.log(test[i].info.queueId);
}
