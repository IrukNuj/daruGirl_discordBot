import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { Readable } from 'stream';
import { GoogleContext } from 'google/types.js';

const getDriveService = (auth: OAuth2Client): drive_v3.Drive => google.drive({ version: 'v3', auth });

export const downloadToStream = async (url: string): Promise<{ stream: Readable; mimeType: string }> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const stream = Readable.from(Buffer.from(response.data, 'binary'));
  return {
      stream,
      mimeType: response.headers['content-type'] || 'application/octet-stream'
  };
};

export const uploadFileToGoogleDrive = async (
    context: GoogleContext,
    stream: Readable,
    mimeType: string,
    fileName: string
): Promise<string> => {
    const drive = getDriveService(context.auth);
    const fileMetadata = {
        name: fileName,
        parents: [context.driveFolderId],
    };
    const media = {
        mimeType,
        body: stream,
    };

    const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });

    return file.data.webViewLink || '';
};
