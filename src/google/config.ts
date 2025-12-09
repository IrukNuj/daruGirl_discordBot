
/** コンフィグ設定を取得 (Read) */
export const fetchGuildSettings = async (): Promise<GuildSettings> => {
    const context = getGoogleContext();
    const range = `${CONFIG_SHEET_NAME}!A:B`;

    // シートが存在しない可能性を考慮してtry-catch (またはcreateが必要だが、簡易的に読み込み試行)
    try {
        const rows = await fetchGoogleSheetValues(context, range);
        const settings = new Map<string, boolean>();

        if (!rows || rows.length === 0) return settings;

        // 1行目ヘッダースキップなどはせず、単純に全行走査 (ID, Status)
        rows.forEach(([guildId, status]) => {
            if (guildId) {
                settings.set(guildId, status === 'TRUE');
            }
        });
        return settings;
    } catch (e) {
        console.warn('Config sheet not found or empty, returning empty settings.', e);
        return new Map();
    }
};

/** コンフィグ設定を更新 (Upsert) */
export const setGuildSetting = async (guildId: string, isEnabled: boolean): Promise<void> => {
    const context = getGoogleContext();
    const sheets = google.sheets({ version: 'v4', auth: context.auth });

    // 1. 全行読んで対象の行を探す (非効率だがDBがないためこの方法をとる)
    const rows = await fetchGoogleSheetValues(context, `${CONFIG_SHEET_NAME}!A:A`);

    let rowIndex = -1;
    if (rows) {
        rowIndex = rows.findIndex(row => row[0] === guildId);
    }

    const value = isEnabled ? 'TRUE' : 'FALSE';

    if (rowIndex !== -1) {
        // 更新 (行番号は 1-based index)
        const updateRange = `${CONFIG_SHEET_NAME}!B${rowIndex + 1}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: context.spreadsheetId,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[value]] }
        });
    } else {
        // 新規追加
        try {
          await appendToGoogleSheet(context, `${CONFIG_SHEET_NAME}!A:B`, [[guildId, value]]);
        } catch (e) {
            // シートがない場合は作成してから追加するロジックが必要だが、運用で「Config」シート作ってもらう前提とするか、
            // ここでシート追加APIを呼ぶのが親切。今回は簡易実装として「Configシートを作ってください」とエラーログを出す。
            console.error('Failed to append config. Please ensure "Config" sheet exists.', e);
            throw e;
        }
    }
};
