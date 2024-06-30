const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const truths = [
"When was the last time you told a lie?",
"What is your favourite food?"
];

const dares = [
 "Do 10 jumping jacks!",
 "Eat something you dont like!"
];

const eightBallResponses = [
  "Yes",
  "No",
  "Maybe",
  "It is certain",
  "Without a doubt",
  "You may rely on it",
  "Don't count on it",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];


const gameState = {};

// Define commands
const commands = [
    {
        name: '8ball',
        description: 'Ask the magic 8ball a question',
        options: [
            {
                name: 'question',
                type: 3, // The type for a string option is 3
                description: 'The question you want to ask',
                required: true,
            },
        ],
    },
    {
        name: 'start',
        description: 'Start a game of Truth or Dare',
    },
    {
        name: 'end',
        description: 'End the current game of Truth or Dare',
    },
];

// Register commands
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        const channelId = interaction.channelId;

        if (commandName === 'start') {
            gameState[channelId] = 'awaiting_choice';

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('truth')
                        .setLabel('Truth')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('dare')
                        .setLabel('Dare')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('random')
                        .setLabel('Random')
                        .setStyle(ButtonStyle.Primary),
                );

            await interaction.reply({ content: 'The Truth or Dare game has started! Choose an option:', components: [row] });
        } else if (commandName === 'end') {
            if (gameState[channelId]) {
                delete gameState[channelId];
                await interaction.reply('The Truth or Dare game has ended.');
            } else {
                await interaction.reply('There is no active game. Type `/start` to begin.');
            }
        } else if (commandName === '8ball') {
            const question = interaction.options.getString('question');
            const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
            await interaction.reply({ content: `Question: ${question}\nAnswer: ${response}` });
        }
    } else if (interaction.isButton()) {
        const { customId, channelId } = interaction;
        if (!gameState[channelId]) {
            await interaction.reply({ content: 'There is no active game. Type `/start` to begin.', ephemeral: true });
            return;
        }

        let content;
        if (customId === 'truth') {
            const truth = truths[Math.floor(Math.random() * truths.length)];
            content = `Truth: ${truth}`;
        } else if (customId === 'dare') {
            const dare = dares[Math.floor(Math.random() * dares.length)];
            content = `Dare: ${dare}`;
        } else if (customId === 'random') {
            if (Math.random() < 0.5) {
                const truth = truths[Math.floor(Math.random() * truths.length)];
                content = `Truth: ${truth}`;
            } else {
                const dare = dares[Math.floor(Math.random() * dares.length)];
                content = `Dare: ${dare}`;
            }
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('truth')
                    .setLabel('Truth')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('dare')
                    .setLabel('Dare')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('random')
                    .setLabel('Random')
                    .setStyle(ButtonStyle.Primary),
            );

        await interaction.reply({ content, components: [row] });
    }
});

client.login(token);