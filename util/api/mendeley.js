import open from "open";
import {resolve} from "path";
import {lstat, readFile, rm} from "fs/promises";
import axios from "axios";
import {getUnderscoreGlobals} from "../environment.js";

const [__filename, __dirname] = getUnderscoreGlobals(import.meta.url);

export const authenticate = async (clientId, clientSecret) => {
    const redirectUri = "obsidiansync://mendeley";
    const state = Date.now().toString() + Math.random().toString();

    const authorisationUrl = `https://api.mendeley.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURI(redirectUri)}&response_type=code&scope=all&state=${state}`;

    await open(authorisationUrl);

    const callbackUrl = await new Promise(r => {
        const callbackFile = resolve(__dirname, '..', '..', 'obsidianSyncCallback.url');
        const interval = setInterval(() => {
            console.log('Waiting for authorisation...');
            lstat(callbackFile)
                .then(() => readFile(callbackFile))
                .then(contents => contents.toString())
                .then(contents => {
                    if (contents.indexOf('mendeley') !== -1) {
                        clearInterval(interval);
                        rm(callbackFile).then(() => {
                            r(contents.replace(/^'/, '').replace(/'$/, ''));
                        });
                    }
                })
                .catch(e => {
                });
        }, 2000);
    });

    const parsedUrl = new URL(callbackUrl);
    const authCode = parsedUrl.searchParams.get('code');
    const authState = parsedUrl.searchParams.get('state');

    if (state !== authState) throw new Error('State does not match, possible session hijack, cancelling');

    const {data: {access_token}} = await axios.post('https://api.mendeley.com/oauth/token', {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
    }, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        auth: {username: clientId, password: clientSecret},
    });

    return {headers: {Authorization: `Bearer ${access_token}`}};
};

export const getCollectionId = async (name, authOptions) => {
    const {data} = await axios.get('https://api.mendeley.com//folders', authOptions);

    return data.find(f => f.name === name)?.id;
};
