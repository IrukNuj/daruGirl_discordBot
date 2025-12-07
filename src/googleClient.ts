
import { google, sheets_v4, drive_v3 } from 'googleapis';
import axios from 'axios';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

/** JSONキーファイルの必要最小限の定義 */
type Credentials = {
  client_email?: string;
  private_key?: string;
};

type GoogleContext = {
    auth: OAuth2Client;
    spreadsheetId: string;
    driveFolderId: string;
};

// --- Pure / Configuration ---

const getCredentials = (): Credentials =>
  JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

const createAuthClient = (credentials: Credentials): OAuth2Client => {
  const auth = google.auth.fromJSON(credentials) as OAuth2Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).scopes = SCOPES;
  return auth;
};

const getContext = (): GoogleContext => ({
    auth: createAuthClient(getCredentials()),
    spreadsheetId: process.env.SPREADSHEET_ID || '',
    driveFolderId: process.env.DRIVE_FOLDER_ID || '',
});

// --- Service Factories ---
const getSheetsService = (auth: OAuth2Client): sheets_v4.Sheets => google.sheets({ version: 'v4', auth });
const getDriveService = (auth: OAuth2Client): drive_v3.Drive => google.drive({ version: 'v3', auth });

// --- Core Operations (Single Responsibility) ---

export const appendToSheet = async (context: GoogleContext, range: string, values: string[][]): Promise<void> => {
  const sheets = getSheetsService(context.auth);
  await sheets.spreadsheets.values.append({
    spreadsheetId: context.spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
};

export const fetchSheetValues = async (context: GoogleContext, range: string): Promise<string[]> => {
  const sheets = getSheetsService(context.auth);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: context.spreadsheetId,
    range,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.data.values ? (res.data.values.flat() as string[]) : [];
};

const downloadToStream = async (url: string): Promise<{ stream: Readable; mimeType: string }> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const stream = Readable.from(Buffer.from(response.data, 'binary'));
  return {
      stream,
      mimeType: response.headers['content-type'] || 'application/octet-stream'
  };
};

const uploadFileToDrive = async (
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

// --- Exported Composition Functions (The "Effects") ---

export const appendTask = async (task: string): Promise<void> =>
    appendToSheet(getContext(), 'A:A', [[task]]);

export const getTasks = async (): Promise<string[]> =>
    fetchSheetValues(getContext(), 'A:A');

export const getRandomTask = async (): Promise<string | null> => {
    const tasks = await getTasks();
    return tasks.length > 0
        ? tasks[Math.floor(Math.random() * tasks.length)]
        : null;
};

/** 画像のDL、Driveへの保存、シートへの記録を一括で行う */
export const uploadImage = async (imageUrl: string, memo: string): Promise<string> => {
    const context = getContext();

    // 1. Download
    const { stream, mimeType } = await downloadToStream(imageUrl);

    // 2. Upload
    const fileName = `illustration_${Date.now()}.png`;
    const webViewLink = await uploadFileToDrive(context, stream, mimeType, fileName);

    // 3. Log
    // A=Empty, B=Link, C=Memo
    await appendToSheet(context, 'A:C', [['', webViewLink, memo]]);

    return webViewLink;
};
