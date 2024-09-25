import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { AppAPI, CnCNet5Abbreviation, CnCNet5GameChannel } from './AppAPI';
import { MessageUpdater } from './MessageUpdater';
import { ChannelUpdater } from './ChannelUpdater';

interface ChannelAndGame
{
    discordServerId: string;
    discordChannelId: string;
    ircGamesChannel: string;
    abbreviation: CnCNet5Abbreviation;
    gameName: string;
    gameUrl: string;
}

export class DiscordBot
{
    private client: Client;
    private gameAPI: AppAPI;
    private messageUpdater: MessageUpdater;
    private channelUpdater: ChannelUpdater;

    private channels: ChannelAndGame[] = [
        // Test server
        // {
        //     discordServerId: "1263904444009943051",
        //     discordChannelId: "1287719868522823731",
        //     ircGamesChannel: CnCNet5GameChannel.PP,
        //     abbreviation: CnCNet5Abbreviation.PP,
        //     gameName: "Project Phantom",
        //     gameUrl: "https://cncnet.org/project-phantom"
        // },
        // CnCNet Server
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445845242511390",
            ircGamesChannel: CnCNet5GameChannel.PP,
            abbreviation: CnCNet5Abbreviation.PP,
            gameName: "Project Phantom",
            gameUrl: "https://cncnet.org/project-phantom"
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445422448148511",
            ircGamesChannel: CnCNet5GameChannel.DTA,
            abbreviation: CnCNet5Abbreviation.DTA,
            gameName: "Dawn of the Tiberium Age",
            gameUrl: "https://cncnet.org/dawn-of-the-tiberium-age"
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445810257825824",
            ircGamesChannel: CnCNet5GameChannel.YR,
            abbreviation: CnCNet5Abbreviation.YR,
            gameName: "Red Alert 2 & Yuri's Revenge",
            gameUrl: "https://cncnet.org/red-alert-2"
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445773930958858",
            ircGamesChannel: CnCNet5GameChannel.MO,
            abbreviation: CnCNet5Abbreviation.MO,
            gameName: "Mental Omega",
            gameUrl: "https://cncnet.org/mental-omega"
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

        this.gameAPI = new AppAPI();
        this.messageUpdater = new MessageUpdater(this.client);
        this.channelUpdater = new ChannelUpdater(this.client);

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
            const playersOnline = await this.gameAPI.fetchPlayersOnline(channelAndGame.abbreviation)

            const server = await this.client.guilds.fetch(channelAndGame.discordServerId);
            await this.sleep(2000);

            const channel = server.channels.cache.get(channelAndGame.discordChannelId) as TextChannel;
            await this.messageUpdater.updateMessage(games, channel, playersOnline, channelAndGame.gameName, channelAndGame.gameUrl);
            await this.sleep(2000);

            await this.channelUpdater.updateChannelName(gamesCount, channel);
        }
    }

    private sleep(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
