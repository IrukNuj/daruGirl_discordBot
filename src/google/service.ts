import { getGoogleContext } from './auth.js';
import { appendToGoogleSheet, fetchGoogleSheetValues } from './sheets.js';
import { uploadFileToGoogleDrive, downloadToStream } from './drive.js';

export const appendTask = async (task: string): Promise<void> =>
    appendToGoogleSheet(getGoogleContext(), 'A:A', [[task]]);

export const getTasks = async (): Promise<string[]> =>
    fetchGoogleSheetValues(getGoogleContext(), 'A:A');

export const getRandomTask = async (): Promise<string | null> => {
    const tasks = await getTasks();
    return tasks.length > 0
        ? tasks[Math.floor(Math.random() * tasks.length)]
        : null;
};

/** 画像のDL、Driveへの保存、シートへの記録を一括で行う */
export const uploadImage = async (imageUrl: string, memo: string): Promise<string> => {
    const context = getGoogleContext();

    // 1. Download
    const { stream, mimeType } = await downloadToStream(imageUrl);

    // 2. Upload
    const fileName = `illustration_${Date.now()}.png`;
    const webViewLink = await uploadFileToGoogleDrive(context, stream, mimeType, fileName);

    // 3. Log
    // A=Empty, B=Link, C=Memo
    await appendToGoogleSheet(context, 'A:C', [['', webViewLink, memo]]);

    return webViewLink;
};
