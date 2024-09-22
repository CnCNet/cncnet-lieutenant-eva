import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { GameAPI } from './GameAPI';
import { MessageUpdater } from './MessageUpdater';
import { ChannelUpdater } from './ChannelUpdater';

interface ChannelAndGame
{
    discordServerId: string;
    discordChannelId: string;
    ircGamesChannel: string;
}

export class DiscordBot
{
    private client: Client;
    private gameAPI: GameAPI;
    private messageUpdater: MessageUpdater;
    private channelManager: ChannelUpdater;

    private channels: ChannelAndGame[] = [
        {
            // Test server
            discordServerId: "1263904444009943051",
            discordChannelId: "1287351178371268682",
            ircGamesChannel: "projectphantom-games"
        }
    ];

    constructor()
    {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages
            ],
        });

        this.gameAPI = new GameAPI();
        this.messageUpdater = new MessageUpdater(this.client);
        this.channelManager = new ChannelUpdater(this.client);

        this.initialize();
    }

    private initialize()
    {
        this.client.once('ready', async () =>
        {
            console.log(`Logged in as ${this.client.user?.tag}!`);
            this.updateGamesInfo();

            // Update every 60 seconds
            setInterval(() => this.updateGamesInfo(), 60 * 1000);
        });

        this.client.on('error', (error) =>
        {
            console.error('An error occurred:', error);
        });

        this.client.login(process.env.TOKEN);
    }

    private async updateGamesInfo()
    {
        for (let i = 0; i < this.channels.length; i++)
        {
            const channelAndGame = this.channels[i];
            const games = await this.gameAPI.fetchGameData(channelAndGame.ircGamesChannel);
            const gamesCount = games.length;

            const server = await this.client.guilds.fetch(channelAndGame.discordServerId);
            await this.sleep(2000);

            const channel = server.channels.cache.get(channelAndGame.discordChannelId) as TextChannel;
            await this.channelManager.updateChannelName(gamesCount, channel);
            await this.sleep(2000);
            await this.messageUpdater.updateMessage(games, channel);
        }
    }

    private sleep(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
