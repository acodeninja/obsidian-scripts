#!/usr/bin/env node

import ProtocolRegistry from 'protocol-registry';
import {dirname, join, resolve} from "path";
import {fileURLToPath} from "url";
import {writeFile} from "fs/promises";
import {getUnderscoreGlobals} from "./util/environment.js";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

const syncCallbackUri = process.argv.find(l => l.indexOf('obsidiansync:') !== -1);

console.log(process.argv);

if (!syncCallbackUri) {
    ProtocolRegistry.register({
        protocol: "obsidiansync",
        command: `/home/lawrence/.nvm/versions/node/v18.16.1/bin/node ${resolve(__dirname, 'obsidian-sync-uri-handler.js')} "$_URL_"`,
        override: true,
        terminal: true,
    }).then(async () => {
        console.log("Successfully registered obsidiansync:// uri handler.");
    });
} else {
    console.log(`processing ${syncCallbackUri}`);
    await writeFile(resolve(__dirname, 'obsidianSyncCallback.url'), syncCallbackUri);
}
