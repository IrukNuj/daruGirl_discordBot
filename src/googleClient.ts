
import { google } from 'googleapis';
import axios from 'axios';
import { Readable } from 'stream';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  return google.auth.fromJSON(credentials);
}

// Sheets API Wrapper
export async function appendTask(task: string): Promise<void> {
  const auth = getAuthClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).scopes = SCOPES;
  const sheets = google.sheets({ version: 'v4', auth });

  const resource = {
    values: [[task]],
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'A:A',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: resource,
  });
}

export async function getTasks(): Promise<string[]> {
  const auth = getAuthClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).scopes = SCOPES;
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'A:A',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.data.values ? (res.data.values.flat() as string[]) : [];
}

export async function getRandomTask(): Promise<string | null> {
  const tasks = await getTasks();
  if (tasks.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * tasks.length);
  return tasks[randomIndex];
}

// Drive API Wrapper
export async function uploadImage(imageUrl: string, memo: string): Promise<string> {
  const auth = getAuthClient();
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).scopes = SCOPES;
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Download image
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const stream = Readable.from(buffer);

  // 2. Upload to Drive
  const fileMetadata = {
    name: `illustration_${Date.now()}.png`,
    parents: [process.env.DRIVE_FOLDER_ID || ''],
  };
  const media = {
    mimeType: response.headers['content-type'],
    body: stream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  const webViewLink = file.data.webViewLink || '';

  // 3. Log to Sheet
  const resource = {
    values: [['', webViewLink, memo]], // A=Empty, B=Link, C=Memo
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'A:C',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: resource,
  });

  return webViewLink;
}
