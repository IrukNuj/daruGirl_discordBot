import { OAuth2Client } from 'google-auth-library';

/** JSONキーファイルの必要最小限の定義 */
export type Credentials = {
  client_email?: string;
  private_key?: string;
};

export type GoogleContext = {
    auth: OAuth2Client;
    spreadsheetId: string;
    driveFolderId: string;
};
