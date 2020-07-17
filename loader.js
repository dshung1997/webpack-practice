const { readFile, existsSync } = require("fs");
const crypto = require("crypto");
const path = require("path");

const asyncStringReplace = async (str, regex, aReplacer) => {
  const substrs = [];
  let match;
  let i = 0; // index

  // iterate over the string and match against the regex
  while ((match = regex.exec(str)) !== null) {
    // put non-matching chunk
    substrs.push(str.slice(i, match.index));

    // call the async replacer function with the matched array spreaded
    substrs.push(aReplacer(...match));

    // update index
    i = regex.lastIndex;
  }

  // put the rest of str
  substrs.push(str.slice(i));

  // wait for aReplacer calls to finish and join them back into string
  return (await Promise.all(substrs)).join("");
};

module.exports = async function (source, map) {
  return await asyncStringReplace(
    source,
    /src={?"\/?(.*)\/*"}?/g,
    (_, matchedPath) => {
      return new Promise((resolve, reject) => {
        let resolvedPath = "/public/" + matchedPath;
        const absolutePath = path.join(__dirname, resolvedPath);

        if (!existsSync(absolutePath)) {
          reject(new Error(`Cannot find file: ${resolvedPath}...`));
        } else {
          readFile(absolutePath, (err, data) => {
            if (err) {
              reject(new Error(`Got error reading file: ${resolvedPath}...`));
            } else {
              const hash = crypto.createHash("sha1");
              hash.setEncoding("hex");
              hash.write(data);
              hash.end();

              resolve(
                `src={"${resolvedPath}?v=${hash.read().substring(0, 8)}"}`
              );
            }
          });
        }
      });
    }
  );
};
