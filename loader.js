const asyncStringReplace = async (str, regex, aReplacer) => {
  const substrs = [];
  let match;
  let i = 0; // index

  // iterate over the string and match against the regex
  while ((match = regex.exec(str)) !== null) {
    // put non matching string
    substrs.push(str.slice(i, match.index));
    // call the async replacer function with the matched array spreaded
    substrs.push(aReplacer(...match));
    i = regex.lastIndex;
  }
  // put the rest of str
  substrs.push(str.slice(i));
  // wait for aReplacer calls to finish and join them back into string
  return (await Promise.all(substrs)).join("");
};

module.exports = function (source, map) {
  console.log("loader.......");

  source = source.replace(
    /src={?"(?:\/?public)?(.*)"}?/g,
    (matchedString, matchedSubstr) => {
      matchedSubstr = matchedSubstr.replace(/\/*$/g, ""); // remove all trailing / in the url

      return `src={"/public${matchedSubstr}?v=1234"}`;
    }
  );

  // source = await asyncStringReplace(source, /src={?"(?:\/?public)?(.*)"}?/g, async (matchedString, path) => {
  //   path = path.replace(/\/*$/g, "");

  //   return `src={"${matchedSubstr}?v=1234"}`;

  // })

  console.log(source);

  this.callback(null, source, map);
  // return "export default aaaa";
};
