import { getGoogleContext } from '@/google/auth.js';
// import { appendToGoogleSheet, fetchGoogleSheetValues, clearGoogleSheet } from '@/google/sheets.js';
import { uploadFileToGoogleDrive, downloadToStream } from '@/google/drive.js';

/** 画像のDL、Driveへの保存を行う (Sheetへの保存は行わない) */
export const uploadImageToDrive = async (imageUrl: string): Promise<{ webViewLink: string }> => {
    const context = getGoogleContext();

    // 1. Download
    const { stream, mimeType } = await downloadToStream(imageUrl);

    // 2. Upload
    const fileName = `illustration_${Date.now()}.png`;
    const webViewLink = await uploadFileToGoogleDrive(context, stream, mimeType, fileName);

    return { webViewLink };
};
