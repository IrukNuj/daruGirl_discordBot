import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { COMMAND_NAMES } from '@/discord/constants';
import { handleAddTask, handleListTasks, handlePickTask, handleDeleteTask, handleDeleteSelect } from '@/discord/handlers/taskHandler';
import { handleAddImage } from '@/discord/handlers/imageHandler';
import { handleConfigureReport } from '@/discord/handlers/reportHandler';

export type CommandHandler = (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;

export const commandHandlers: Record<string, CommandHandler> = {
  [COMMAND_NAMES.TASK.ADD]: handleAddTask,
  [COMMAND_NAMES.TASK.LIST]: handleListTasks,
  [COMMAND_NAMES.TASK.PICK]: handlePickTask,
  [COMMAND_NAMES.IMAGE.ADD]: handleAddImage,
  [COMMAND_NAMES.REPORT.CONFIGURE]: handleConfigureReport,
  [COMMAND_NAMES.TASK.DELETE]: handleDeleteTask,
};

// Re-export specific handlers if needed by other modules (like events.ts needs deleteSelect)
export { handleDeleteSelect };
