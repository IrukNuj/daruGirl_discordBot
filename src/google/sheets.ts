import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleContext } from './types.js';

const getSheetsService = (auth: OAuth2Client): sheets_v4.Sheets => google.sheets({ version: 'v4', auth });

export const appendToGoogleSheet = async (context: GoogleContext, range: string, values: string[][]): Promise<void> => {
  const sheets = getSheetsService(context.auth);
  await sheets.spreadsheets.values.append({
    spreadsheetId: context.spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
};

export const fetchGoogleSheetValues = async (context: GoogleContext, range: string): Promise<string[]> => {
  const sheets = getSheetsService(context.auth);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: context.spreadsheetId,
    range,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.data.values ? (res.data.values.flat() as string[]) : [];
};

export const clearGoogleSheet = async (context: GoogleContext, range: string): Promise<void> => {
	const sheets = getSheetsService(context.auth);
	await sheets.spreadsheets.values.clear({
		spreadsheetId: context.spreadsheetId,
		range,
	});
};
