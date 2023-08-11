import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import {readFile} from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadEnvironment = async () =>
    await readFile(resolve(__dirname, '..', '.secrets'))
        .then(file => file.toString().split('\n'))
        .then(lines => lines.map(l => [l.split('=')[0], l.split('=').slice(1).join('=')]))
        .then(lines => lines.filter(([name, value]) => !!name && !!value))
        .then(lines => lines.forEach(([name, value]) => {
            process.env[name] = value;
        }));

export const getUnderscoreGlobals = (url) => {
    const __filename = fileURLToPath(url);
    const __dirname = dirname(__filename);
    return [__filename, __dirname];
}
