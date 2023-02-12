/**
 * Generate a CSV file containing strings for a langauge with their
 * qqq and english translations, to assist translators. Requires
 * an existing translation, that should pass npm run tx
 * Example: node bin/genStringsCSV.js de
 * to generate strings for German.
 */
import { promises as Fs } from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { format as csv } from "@fast-csv/format";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18n_path = path.normalize(path.join(__dirname, "..", "i18n"));

const outlang = process.argv[2];
const langs = {};
Fs.readdir(i18n_path)
.then(d => d.filter(f => f != "index.json" && /\.json$/.test(f))
      .map(f => {
        return Fs.readFile(path.join(i18n_path, f))
        .then(b => JSON.parse(b.toString()))
        .then(lang => langs[f.replace(/\.json$/, "")] = lang);
      }))
.then(promises => Promise.all(promises))
.then(() => {
  const qqq = langs.qqq;
  delete langs.qqq;
  const stream = csv();
  stream.pipe(process.stdout);
  for (const s in qqq) {
    if (s == "@metadata") continue;
    stream.write([
      s,
      qqq[s],
      langs.en[s],
      langs[outlang][s]
    ]);
  }
});
