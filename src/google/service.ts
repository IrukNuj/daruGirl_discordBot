import { getGoogleContext } from '@/google/auth.js';
import { appendToGoogleSheet, fetchGoogleSheetValues, clearGoogleSheet } from '@/google/sheets.js';
import { uploadFileToGoogleDrive, downloadToStream } from '@/google/drive.js';

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

export const deleteTasks = async (tasksToDelete: string[]): Promise<void> => {
	const context = getGoogleContext();
	const currentTasks = await getTasks();

	// 削除対象に含まれないものだけを残す
	const newTasks = currentTasks.filter(task => !tasksToDelete.includes(task));

	// A列を全クリアしてから書き直す (簡易実装)
	await clearGoogleSheet(context, 'A:A');
	if (newTasks.length > 0) {
		// 1行ずつ配列にして渡す必要あり: [['foo'], ['bar']]
		const values = newTasks.map(t => [t]);
		await appendToGoogleSheet(context, 'A:A', values);
	}
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
