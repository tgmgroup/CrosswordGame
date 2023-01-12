/*Copyright (C) 2019-2023 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

/**
 * Check that strings occur in code and translations files
 */
import readline from "readline/promises";

import { promises as Fs } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Maximum length for a string identifier
const MAX_ID_LENGTH = 20;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = path.normalize(path.join(__dirname, ".."));

// map string to file where it was found. Seed with @metadata which is
// always in .json files
const found = { "@metadata": "all .json" };
// map file path to contents
const fileContents = {};

// Add string to found list
function addString(string, file) {
  if (!found[string])
    found[string] = {};
  found[string][file] = true;
}

// Recursively load all files with given extension into fileContents
// return a promise that resolves to a flat list of files loaded
function load(file, ext, exclude) {
  file = path.normalize(file);
  if (ext.test(file) && (!exclude || !exclude.test(file))) {
    return Fs.readFile(file)
    .then(buff => fileContents[file] = buff.toString())
    .then(() => [ file ]);
  }
  return Fs.readdir(file)
  .then(files => Promise.all(
    files.map(
      f => load(path.join(file, f), ext, exclude)))
        .then(files => files.flat()))
  .catch(e => []);
}

// Scan file for occurrences of re in the given files
// and add them to found list
function scan(files, re) {
  let m;
  for (const file of files) {
    while ((m = re.exec(fileContents[file])))
      addString(m[2], file);
  }
  return files;
}

// check the paramers of string 'id' match in qqqString and the langString
function checkParameters(id, qqqString, langString, mess) {
  if (/^_.*_$/.test(qqqString))
    return;
  let m, rea = /(\$\d+)/g;
  while ((m = rea.exec(qqqString))) {
    let p = m[1];
    const reb = new RegExp(`\\${p}([^\\d]|\$)`);
    if (!reb.test(langString))
      mess.push(`\t"${id}": ${p} not found in "${langString}"`);
  }
  while ((m = rea.exec(langString))) {
    let p = m[1];
    const reb = new RegExp(`\\${p}([^\\d]|\$)`);
    if (!reb.test(qqqString))
      mess.push(`\t"${id}": ${p} unexpected in "${langString}"`);
  }
}

// Prompt to change the id of string
// return -2 to abort the run, -1 to ask again, 0 for no change, 1
// if the string was changed
async function changeLabel(lang, string, probably) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log(strings[lang][string]);
  const q = `Change ID "${string}"${probably ? (' to "'+probably+'"') : ""} in ${lang} [yNq]? `;
  return rl.question(q)
  .then(answer => {
    rl.close();
    switch (answer) {
    case "q": case "Q": // quit
      return -2;
    case undefined: case "": case "n": case "N":
      return 0;
    case 'y': case 'Y':
      if (probably) {
        answer = probably;
        break;
      }
    }
    if (strings[lang][answer]) {
      console.error(`${answer} is already used in ${lang}`);
      return -1; // conflict, try again
    }
    console.log(`\tChanging "${string}" to "${answer}" in ${lang}`);
    for (const lang in strings) {
      strings[lang][answer] = strings[lang][string];
      delete strings[lang][string];
    }
    const rs = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(["'])${rs}\\1`, "g");
    const filesChanged = {};
    for (const file in fileContents) {
      const m = /i18n\/(.*)\.json$/.exec(file);
      if (m) {
        // A i18n/.json file. If the label is changed in qqq, change it everywhere.
        // If it's just changing local to a single lang, only change it there
        if (lang === "qqq" || m[1] === lang) {
          fileContents[file] = JSON.stringify(strings[m[1]], null, "  ");
          filesChanged[file] = true;
        }
      } else if (lang === "qqq" && re.test(fileContents[file])) {
        // Another file, only change the label when qqq is changing
        fileContents[file] =
        fileContents[file].replace(re, `"${answer}"`);
        filesChanged[file] = true;
      }
    }
    return Promise.all(
      Object.keys(filesChanged)
      .map(file => Fs.writeFile(file, fileContents[file])))
    .then(() => 1);
  });
}

async function shortenIDs() {
  for (const string in strings.qqq) {
    if (string.length > MAX_ID_LENGTH && !/^Types\./.test(strings.qqq[string])) {
      console.error(`"${string}" is too long for a label`);
      let go = -1;
      while (go === -1) {
        await changeLabel("qqq", string)
        .then(g => go = g);
      }
      if (go === -2)
        break;
    }
  }
}

const strings = {};

Promise.all([
  // load with scan to extract strings
  load(path.join(basePath, "html"), /\.html$/)
  .then(files => scan(
    files, /data-i18n(?:|-placeholder|-tooltip)=(["'])(.*?)\1/g)),
  load(path.join(basePath, "src"), /\.js$/)
  .then(files => scan(files, /\.i18n\s*\(\s*(["'])(.*?)\1/g))
  .then(files => scan(files, /\/\*i18n\*\/\s*(["'])(.*?)\1/g)),
  // just to get fileContents
  load(path.join(basePath, "test"), /\.ut$/),
  load(path.join(basePath, "i18n"), /\.json$/, /^index\.json$/),
  Fs.readdir(`${__dirname}/../i18n`)
  .then(lingos => Promise.all(
    lingos.filter(f => /\.json$/.test(f) && !/^index\.json$/.test(f))
    .map(lingo => Fs.readFile(path.join(basePath, "i18n", lingo))
         .then(json => {
           const lang = lingo.replace(/\.json$/, "");
           strings[lang] = JSON.parse(json);
         })
         .catch(e => {
           console.error(`Parse error reading ${lingo}`);
           throw e;
         }))))
])
.then(async () => {   
  let qqqError = false;

  // Check strings are in qqq and add to en if necessary
  for (const string of Object.keys(found).sort()) {
    if (!strings.qqq[string]) {
      console.error(`"${string}" not found in qqq`);
      strings.qqq[string] = string;
      qqqError = true;
    }
  }

  // Check strings in qqq.json occur at least once in html/js
  for (const string of Object.keys(strings.qqq)
             .filter(s => !found[s])) {
    console.error(
      `"${string}" was found in qqq, but is not used in code`);
    delete strings.qqq[string];
    qqqError = true;
  }

  if (qqqError)
    throw Error("qqq.json must be correct");

  for (const lang of Object.keys(strings).filter(l => l !== "qqq")) {
    let mess = [];

    // Check that all keys in qqq are also in other language
    for (const string of Object.keys(strings.qqq)) {
      if (!strings[lang][string])
        mess.push(`\t"${string}" : qqq "${strings.qqq[string]}" en "${strings.en[string]}"`);
    }
    if (mess.length > 0)
      console.error("----", lang, "is missing translations for:\n",
                    mess.join("\n"));

    // check that the same parameters are present in translated strings
    let messes = 0;
    for (const string of Object.keys(strings[lang])) {
      if (strings.qqq[string] && strings[lang][string]) {
        mess = [];
        checkParameters(string, strings.qqq[string], strings[lang][string], mess);
        if (mess.length > 0) {
          messes++;
          if (messes == 1)
            console.error("----", lang, "has parameter inconsistencies:");
          console.error(mess.join("\n"));
        }
      }
    }

    for (const string of Object.keys(strings[lang])) {
      if (!strings.qqq[string]) {
        console.error(`${lang}: id "${string}" was not found in qqq`);
        for (const enlabel in strings.en) {
          if (strings.en[enlabel] == string) {
            console.error(`${string} is the English translation for id ${enlabel}`);
            await changeLabel(lang, string, enlabel);
          }
        }
      }
    }

    if (lang !== "en") {
      mess = [];
      for (const id of Object.keys(strings[lang])) {
        if (strings[lang][id] == strings.en[id] && strings.en[id].length > 1)
          mess.push(`\t${id} : "${strings.en[id]}"`);
      }
      if (mess.length > 0)
        console.error(
          "----",
          lang,
          "has strings that are the same as in English\n",
          mess.join("\n"));
    }
  }
})
.then(() => shortenIDs());

