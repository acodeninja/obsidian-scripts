import {createWorker, PSM} from "tesseract.js";

export const recognize = async (image, langs, options) => {
    const worker = await createWorker(options);
    await worker.loadLanguage(langs);
    await worker.initialize(langs);
    await worker.setParameters({tessedit_pageseg_mode: PSM.AUTO_OSD})
    return worker.recognize(image)
        .finally(async () => {
            await worker.terminate();
        });
};
