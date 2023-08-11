import {mkdtemp, readdir, readFile, rm, rmdir} from "fs/promises";
import {basename, resolve} from "path";
import {promisify} from "util";
import {exec} from "child_process";
import {createWorker, PSM} from "tesseract.js";
import {franc} from "franc";
import {getUnderscoreGlobals} from "./environment.js";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

export const pdf = async (filePath) => {
    const tempFolder = await mkdtemp('mendeley-sync');
    const languages = ['eng', 'osd'];

    const worker = await createWorker();

    for (const lang of languages) {
        await worker.loadLanguage(lang);
    }

    await worker.initialize('eng');
    await worker.setParameters({tessedit_pageseg_mode: PSM.AUTO_OSD});

    await promisify(exec)(
        `ghostscript -q -dNOPAUSE -dBATCH -sDEVICE=tiffg4 -sOutputFile="${resolve(tempFolder, 'pdf%03d.tiff')}" "${filePath}" -c quit`,
        {cwd: __dirname},
    );

    const tiffFiles = await readdir(tempFolder);
    const pages = await Promise.all(tiffFiles.map(async (f) => await readFile(resolve(tempFolder, f))));

    const ocrOutput = [];

    for (const [index, page] of pages.entries()) {
        const test = await worker.recognize(page, 'osd');
        const language = franc(test.data.text);
        if (!languages.includes(language)) {
            languages.push(language);
            await worker.loadLanguage(language);
        }
        const final = await worker.recognize(page, language);
        console.log(`processed page ${index + 1}/${pages.length} of ${basename(filePath)}, guessing ${language}`);
        ocrOutput.push(final.data.text);
    }

    await Promise.all((await readdir(tempFolder)).map(async (f) => {
        await rm(resolve(tempFolder, f));
    }));
    await rmdir(tempFolder);
    await worker.terminate();

    return ocrOutput.join('\n');
};
