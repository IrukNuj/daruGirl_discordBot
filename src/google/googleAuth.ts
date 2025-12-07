import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Credentials, GoogleContext } from './googleTypes.js';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

const getCredentials = (): Credentials =>
  JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

const createAuthClient = (credentials: Credentials): OAuth2Client => {
  const auth = google.auth.fromJSON(credentials) as OAuth2Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (auth as any).scopes = SCOPES;
  return auth;
};

export const getGoogleContext = (): GoogleContext => ({
    auth: createAuthClient(getCredentials()),
    spreadsheetId: process.env.SPREADSHEET_ID || '',
    driveFolderId: process.env.DRIVE_FOLDER_ID || '',
});
