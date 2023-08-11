import {pdf} from "./util/ocr.js"
import {resolve} from "path";
import {getUnderscoreGlobals} from "./util/environment.js";
import {readFile, writeFile} from "fs/promises";
import {NlpManager} from "node-nlp";
import {dockStart} from "@nlpjs/basic";


const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

// const data = await pdf(resolve(__dirname, '..', 'Academic/References/Files/STRIDE-based threat modeling for cyber-physical systems/2017_STRIDE_based_threat_modeling_for_cyber_physical_systems.pdf'));
//
// await writeFile('test.json', JSON.stringify(data, null, 2));

const data = JSON.parse((await readFile('test.json')).toString());

// const manager = new NlpManager();
// console.log(await manager.process(data));

const dock = await dockStart({ use: ['Basic']});
const nlp = dock.get('nlp');
nlp.addLanguage('en');
await nlp.train();
const response = await nlp.process(data);
console.log(response);
