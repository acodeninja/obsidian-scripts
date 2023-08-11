#!/usr/bin/env node

import {writeFile, readFile, lstat, rm} from "fs/promises";
import {promisify} from "util";
import {exec} from "child_process";
import {resolve, basename, dirname} from "path";
import {getUnderscoreGlobals, loadEnvironment} from "./util/environment.js";
import axios from "axios";
import {ensureDir} from "fs-extra";
import {mendeley as templates} from "./util/templates.js";
import * as api from "./util/api/mendeley.js";
import {extension} from "mime-types";
import {createHash} from "crypto";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

const syncMendeleyReferences = async () => {
    await loadEnvironment();

    const clientId = process.env['MENDELEY_APP_ID'];
    const clientSecret = process.env['MENDELEY_APP_SECRET'];

    await promisify(exec)(resolve(__dirname, 'obsidian-sync-uri-handler.js'));
    const referenceTemplate = await templates.reference();
    const authorTemplate = await templates.author();

    const authOptions = await api.authenticate(clientId, clientSecret);
    const folderToSync = await api.getCollectionId('ReadyForSync', authOptions);

    const rootPath = resolve(__dirname, '..');
    const referencesPath = resolve(rootPath, 'Academic', 'References');
    await ensureDir(referencesPath);
    const authorsPath = resolve(rootPath, 'Academic', 'Authors');
    await ensureDir(authorsPath);
    const filesPath = resolve(referencesPath, 'Files');
    await ensureDir(filesPath);

    const {data: documents} = await axios.get(`https://api.mendeley.com/documents?limit=500&folder_id=${folderToSync}`, authOptions);

    const authors = {};

    for (const document of documents) {
        const documentName = `${document.title.replace(/\//g, ' ')}.md`;
        const {data: files} = await axios.get(`https://api.mendeley.com/files?document_id=${document.id}`, authOptions);
        const documentFiles = [];

        console.log(files);

        for (const file of files) {
            const fileName = file.file_name !== 'full_text.pdf' ? file.file_name : `${file.id}.${extension(file.mime_type)}`;
            const filePath = resolve(filesPath, fileName);

            try {
                await lstat(filePath);
            } catch (e) {
                console.log(`File ${filePath}.pdf does not exist, downloading.`);

                const {data: fileBlob} = await axios.get(`https://api.mendeley.com/files/${file.id}`, {
                    ...authOptions,
                    responseType: 'arraybuffer'
                });

                await writeFile(filePath, Buffer.from(fileBlob, 'binary'));
            }
            documentFiles.push(fileName);
        }

        for (const author of document.authors) {
            const name = [author.first_name, author.last_name].filter(n => !!n).join(' ');
            const filename = name + '.md';
            const hash = createHash('sha256').update(name).digest('hex');

            authors[hash] = authors[hash] ?? {name, filename, references: []};
            authors[hash].references.push({
                title: document.title,
                path: `Academic/References/${documentName.replace('.md', '')}`,
            });
        }

        console.log({...document, files: documentFiles});

        await writeFile(resolve(referencesPath, documentName), referenceTemplate({
            reference: {...document, files: documentFiles},
        }));
    }

    for (const [_, author] of Object.entries(authors)) {
        await writeFile(resolve(authorsPath, author.filename), authorTemplate({author}));
    }
};

if (process.argv.find(a => a === __filename)) await syncMendeleyReferences();
