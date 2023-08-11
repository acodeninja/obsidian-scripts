import _ from "lodash";
import {readFile} from "fs/promises";
import {getUnderscoreGlobals} from "./environment.js";
import {resolve} from "path";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

export const mendeley = {
    reference: async () =>
        _.template((await readFile(resolve(__dirname, '..', 'templates', 'mendeley', 'reference.md.template'))).toString()),
    author: async () =>
        _.template((await readFile(resolve(__dirname, '..', 'templates', 'mendeley', 'author.md.template'))).toString()),
};
