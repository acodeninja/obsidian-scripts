import {writeFile} from "fs/promises";
import axios from "axios";
import {createGunzip} from "zlib";
import { Readable } from 'stream';

export const downloadFile = async (url, filePath, options = {gzExpand: false}) => {
    let {data: fileBlob} = await axios.get(url, {
        ...options.requestOptions || {},
        responseType: 'arraybuffer'
    });

    if (options.gzExpand) {
        fileBlob = await new Promise((resolve, reject) => {
            const gunzip = createGunzip();
            const output = [];
            const readable = Readable.from(fileBlob);
            readable.pipe(gunzip);

            gunzip.on('data', (data) => {
                output.push(data);
            });

            gunzip.on("end", () => {
                resolve(Buffer.concat(output));
            });

            gunzip.on("error", (e) => {
                reject(e);
            });
        });
    }

    await writeFile(filePath, Buffer.from(fileBlob, 'binary'));
};
