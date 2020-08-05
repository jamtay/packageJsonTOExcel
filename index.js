//USAGE: node index.js  currentExcelFileName outputFileName jsonfilepath
console.warn(
  "USAGE: node index.js  currentExcelFileName outputFileName jsonfilepath/package.json"
);
console.log("Do not include file extensions apart from package.json");
console.log("Input is xlsx format and output is csv");
const fs = require("fs");

const currentExcelFile = process.argv[2];
const outputFile = process.argv[3];
const relativeJsonFilePath = process.argv[4];

const json = require(relativeJsonFilePath);

const excelToJson = require("convert-excel-to-json");

const result = excelToJson({
  sourceFile: `${currentExcelFile}.xlsx`,
  header: {
    rows: 1,
  },
  columnToKey: {
    A: "name",
    B: "B",
    C: "C",
    D: "description",
  },
});

const devOrProduction = (type) => {
  return type === "dependencies" ? "Production" : "Dev";
};

const getCSVStringFromDependency = (type) => {
  let returnString = "";

  if (json && json[type]) {
    Object.entries(json[type]).forEach((dependency) => {
      if (dependency[0].includes("@")) {
        dependency[0] = dependency[0].replace("@", "");
      }

      const currentValue = result.Sheet1.find((row) => {
        let rowName = row.name;
        if (rowName.includes("@")) {
          rowName = rowName.replace("@", "");
        }
        return rowName === dependency[0];
      });

      if (currentValue) {
        returnString += `"${dependency[0]}",${dependency[1]},${devOrProduction(
          type
        )},${currentValue.description}\n`;
      } else {
        returnString += `"${dependency[0]}",${dependency[1]},${devOrProduction(
          type
        )},\n`;
      }
    });
  }

  return returnString;
};

const returnString =
  getCSVStringFromDependency("dependencies") +
  getCSVStringFromDependency("devDependencies");

fs.writeFileSync(`${outputFile}.csv`, returnString, "binary");

console.log("DONE");
