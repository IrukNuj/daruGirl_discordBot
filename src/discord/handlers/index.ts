import { ChatInputCommandInteraction, CacheType } from 'discord.js';
import { COMMAND_NAMES } from '../constants.js';
import { handleAddTask, handleListTasks, handlePickTask, handleDeleteTask, handleDeleteSelect } from './taskHandler.js';
import { handleAddImage } from './imageHandler.js';
import { handleConfigureReport } from './reportHandler.js';

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
