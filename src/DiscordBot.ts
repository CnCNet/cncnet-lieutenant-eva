import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { AppAPI, CnCNet5Abbreviation, CnCNet5GameChannel, ClassicGameAbbreviation as ClassicGameAbbreviation } from './AppAPI';
import { MessageUpdater } from './MessageUpdater';
import { ChannelUpdater } from './ChannelUpdater';

interface ChannelAndGameMetaInfo
{
    discordServerId: string;
    discordChannelId: string;
    ircGamesChannel: string;
    abbreviation: CnCNet5Abbreviation;
    gameName: string;
    gameUrl: string;
    gameLogoUrl: string;
    classicGameAbbreviation: ClassicGameAbbreviation;
    discordUrl?: string;
}

export class DiscordBot
{
    private client: Client;
    private gameAPI: AppAPI;
    private messageUpdater: MessageUpdater;
    private channelUpdater: ChannelUpdater;
    private classicClientGames: ClassicGameAbbreviation[] = [
        ClassicGameAbbreviation.D2,
        ClassicGameAbbreviation.RA,
        ClassicGameAbbreviation.TD,
        ClassicGameAbbreviation.TS,
    ];

    private channels: ChannelAndGameMetaInfo[] = [
        // Test server
        // {
        //     discordServerId: "1263904444009943051",
        //     discordChannelId: "1287719330431242280",
        //     ircGamesChannel: CnCNet5GameChannel.YR,
        //     abbreviation: CnCNet5Abbreviation.YR,
        //     gameName: "Dawn of the Tiberium Age",
        //     gameUrl: "https://cncnet.org/dawn-of-the-tiberium-age",
        //     gameLogo: "https://cncnet.org/storage/images/dta-logo.png",
        // },
        // CnCNet Server
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445845242511390",
            ircGamesChannel: CnCNet5GameChannel.PP,
            abbreviation: CnCNet5Abbreviation.PP,
            gameName: "Project Phantom",
            gameUrl: "https://cncnet.org/project-phantom",
            gameLogoUrl: "https://cncnet.org/storage/images/pp-logo.png",
            discordUrl: "https://discord.gg/BDXUcfU",
            classicGameAbbreviation: null
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445422448148511",
            ircGamesChannel: CnCNet5GameChannel.DTA,
            abbreviation: CnCNet5Abbreviation.DTA,
            gameName: "Dawn of the Tiberium Age",
            gameUrl: "https://cncnet.org/dawn-of-the-tiberium-age",
            gameLogoUrl: "https://cncnet.org/storage/images/dta-logo.png",
            discordUrl: "https://discord.gg/YczsdZC",
            classicGameAbbreviation: null
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445810257825824",
            ircGamesChannel: CnCNet5GameChannel.YR,
            abbreviation: CnCNet5Abbreviation.YR,
            gameName: "Red Alert 2 & Yuri's Revenge",
            gameUrl: "https://cncnet.org/red-alert-2",
            gameLogoUrl: "https://cncnet.org/storage/images/ra2-logo.png",
            classicGameAbbreviation: null
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1288445773930958858",
            ircGamesChannel: CnCNet5GameChannel.MO,
            abbreviation: CnCNet5Abbreviation.MO,
            gameName: "Mental Omega",
            gameUrl: "https://cncnet.org/mental-omega",
            discordUrl: "https://mentalomega.com/discord",
            gameLogoUrl: "https://cncnet.org/storage/images/mo-logo.png",
            classicGameAbbreviation: null
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289602375480246385",
            ircGamesChannel: CnCNet5GameChannel.TD,
            abbreviation: CnCNet5Abbreviation.TD,
            gameName: "Tiberian Dawn",
            gameUrl: "https://cncnet.org/command-and-conquer",
            gameLogoUrl: "https://cncnet.org/storage/images/td-logo.png",
            classicGameAbbreviation: ClassicGameAbbreviation.TD,
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289602311446073426",
            ircGamesChannel: CnCNet5GameChannel.RA,
            abbreviation: CnCNet5Abbreviation.RA,
            gameName: "Red Alert",
            gameUrl: "https://cncnet.org/red-alert",
            gameLogoUrl: "https://cncnet.org/storage/images/ra-logo.png",
            classicGameAbbreviation: ClassicGameAbbreviation.RA,
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289602337404485777",
            ircGamesChannel: CnCNet5GameChannel.TS,
            abbreviation: CnCNet5Abbreviation.TS,
            gameName: "Tiberian Sun",
            gameUrl: "https://cncnet.org/tiberian-sun",
            gameLogoUrl: "https://cncnet.org/storage/images/ts-logo.png",
            classicGameAbbreviation: ClassicGameAbbreviation.TS,
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289602435085762622",
            ircGamesChannel: CnCNet5GameChannel.D2,
            abbreviation: CnCNet5Abbreviation.D2,
            gameName: "Dune 2000",
            gameUrl: "https://cncnet.org/dune-2000",
            gameLogoUrl: "https://cncnet.org/storage/images/d2k-logo.png",
            classicGameAbbreviation: ClassicGameAbbreviation.D2,
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289610821357404240",
            ircGamesChannel: CnCNet5GameChannel.CNCR,
            abbreviation: CnCNet5Abbreviation.CNCR,
            gameName: "C&C Reloaded",
            gameUrl: "https://cncnet.org/cnc-reloaded",
            discordUrl: "https://discord.gg/NNErBGM",
            gameLogoUrl: "https://cncnet.org/storage/images/cncr-logo.png",
            classicGameAbbreviation: null
        },
        {
            discordServerId: "188156159620939776",
            discordChannelId: "1289989427560583249",
            ircGamesChannel: CnCNet5GameChannel.ROTE,
            abbreviation: CnCNet5Abbreviation.ROTE,
            gameName: "Rise of the East",
            gameUrl: "https://cncnet.org/rise-of-the-east",
            discordUrl: "https://discord.com/invite/X4WaZwx",
            gameLogoUrl: "https://cncnet.org/storage/images/rote-logo.png",
            classicGameAbbreviation: null
        },
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
            const playersOnline = await this.gameAPI.fetchPlayersOnline(channelAndGame.abbreviation);

            const server = await this.client.guilds.fetch(channelAndGame.discordServerId);
            await this.sleep(2000);

            const channel = server.channels.cache.get(channelAndGame.discordChannelId) as TextChannel;
            let gameCount = games.length;

            if (this.classicClientGames.indexOf(channelAndGame.classicGameAbbreviation) > -1)
            {
                const classicGamesOnline = await this.gameAPI.fetchClassicClientGames(channelAndGame.classicGameAbbreviation);
                gameCount += classicGamesOnline;
            }

            await this.messageUpdater.updateMessage(
                games,
                channel,
                gameCount,
                playersOnline,
                channelAndGame.gameName,
                channelAndGame.gameUrl,
                channelAndGame.gameLogoUrl,
                channelAndGame.classicGameAbbreviation == null,
                channelAndGame.discordUrl
            );

            await this.sleep(2000);
            await this.channelUpdater.updateChannelName(gameCount, channel);
        }
    }

    private sleep(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
