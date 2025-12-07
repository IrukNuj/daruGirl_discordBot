
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import { appendTask, getTasks, getRandomTask, uploadImage } from './googleClient.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder().setName('やりたいことついか').setDescription('タスクを追加します').addStringOption(option => option.setName('内容').setDescription('タスクの内容').setRequired(true)),
  new SlashCommandBuilder().setName('やりたいことりすと').setDescription('タスク一覧を表示します'),
  new SlashCommandBuilder().setName('やりたいこととりだし').setDescription('ランダムにタスクを提案します'),
  new SlashCommandBuilder().setName('いらすとついか').setDescription('イラストをDriveに保存します').addAttachmentOption(option => option.setName('画像').setDescription('保存する画像').setRequired(true)).addStringOption(option => option.setName('メモ').setDescription('画像のメモ')),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN || '');

client.on('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  try {
    console.log('Started refreshing application (/) commands.');
    if (process.env.CLIENT_ID && process.env.GUILD_ID) {
        await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } else {
        console.error('CLIENT_ID or GUILD_ID is missing in .env');
    }
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'やりたいことついか') {
      const task = interaction.options.getString('内容');
      if (task) {
          await interaction.deferReply();
          await appendTask(task);
          await interaction.editReply(`「${task}」をリストに追加したよ！`);
      } else {
          await interaction.reply({ content: '内容が空だよ！', ephemeral: true });
      }
    } else if (commandName === 'やりたいことりすと') {
      await interaction.deferReply();
      const tasks = await getTasks();
      const taskList = tasks.map(t => `- ${t}`).join('\n') || 'リストは空だよ！';
      await interaction.editReply(`**やりたいことリスト**\n${taskList}`);
    } else if (commandName === 'やりたいこととりだし') {
      await interaction.deferReply();
      const task = await getRandomTask();
      await interaction.editReply(task ? `これどう？: **${task}**` : 'リストは空だよ！');
    } else if (commandName === 'いらすとついか') {
      const image = interaction.options.getAttachment('画像');
      const memo = interaction.options.getString('メモ') || '';

      if (image && image.contentType && image.contentType.startsWith('image/')) {
        await interaction.deferReply();
        const link = await uploadImage(image.url, memo);
        await interaction.editReply(`画像を保存したよ！\nリンク: ${link}\nメモ: ${memo}`);
      } else {
         await interaction.reply({ content: '画像ファイルを選択してね！', ephemeral: true });
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'エラーが発生したよ...', ephemeral: true });
    } else {
      await interaction.reply({ content: 'エラーが発生したよ...', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
