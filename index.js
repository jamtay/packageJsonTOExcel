//USAGE: node index.js  currentExcelFileName outputFileName jsonfilepath
console.warn(
  "USAGE: node index.js <directoryname>      // run from a direcotry next to the directory"
);
console.log("Input is xlsx format and output is csv");
console.log("Don't include a header in either file")
const fs = require("fs");

const currentExcelFile = process.argv[2];
const outputFile = `${process.argv[2]}-output`;
const relativeJsonFilePath = `../directory/${process.argv[2]}/package.json`;

const json = require(relativeJsonFilePath);

const excelToJson = require("convert-excel-to-json");

const result = excelToJson({
  sourceFile: `data/${currentExcelFile}.xlsx`,
  header: {
    rows: 0,
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

fs.writeFileSync(`data/${outputFile}.csv`, returnString, "binary");

console.log("DONE");
