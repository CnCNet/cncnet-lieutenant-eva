import { Client, TextChannel, Message } from 'discord.js';
import { Game } from './GameAPI';

export class MessageUpdater
{
    private client: Client;
    private maxMessageLength: number;

    constructor(client: Client)
    {
        this.client = client;
        this.maxMessageLength = 2500;
    }

    public async updateMessage(games: Game[], channel: TextChannel): Promise<void>
    {
        try
        {
            const messages = await channel.messages.fetch({ limit: 5 });
            const botMessage = messages.find((msg: Message) => msg.author.id === this.client.user?.id);

            const availableGames = games.filter(game => !game.is_closed && !game.is_custom_password && !game.locked);
            const unavailableGames = games.filter(game => game.is_closed || game.is_custom_password || game.locked);

            let messageContent = `**Games (${games.length}): ** \n`;
            let remainingGames = games.length;
            let truncated = false;

            for (const game of availableGames)
            {
                const gameDetails = this.formatGameDetails(game, true);
                if (messageContent.length + gameDetails.length > this.maxMessageLength)
                {
                    truncated = true;
                    break;
                }
                messageContent += gameDetails;
                remainingGames--;
            }

            if (!truncated)
            {
                for (const game of unavailableGames)
                {
                    const gameDetails = this.formatGameDetails(game, false);
                    if (messageContent.length + gameDetails.length > this.maxMessageLength)
                    {
                        truncated = true;
                        break;
                    }
                    messageContent += gameDetails;
                    remainingGames--;
                }
            }

            if (truncated)
            {
                messageContent += `\nand ${remainingGames} more games...`;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            messageContent += `\n\n_Last updated: <t:${currentTime}:R>_`;

            if (botMessage)
            {
                await botMessage.edit(messageContent);
            } else
            {
                await channel.send(messageContent);
            }
        }
        catch (error)
        {
            console.error('Error updating or posting message:', error);
        }
    }

    private formatGameDetails(game: Game, isAvailable: boolean): string
    {
        const playerCount = game.players.split(",").length;
        const gameStatus = isAvailable ? ':green_circle: *Available*' :
            `${game.is_closed ? ':no_entry_sign: *Closed*' : ''} ${game.locked ? ':watch: *In progress*' : ''} ${game.is_custom_password ? ':key:' : ''}`;

        return `- **${game.game_room}** *(${playerCount}/${game.max_players})* \n` +
            `  - **Players: ** ${game.players.split(',').map((playerName) => ` ${playerName} `)}\n` +
            `  - **Map: ** ${game.map_name}\n` +
            `  - **Mode: ** ${game.game_mode}\n` +
            `  - ${gameStatus} \n\n`;
    }
}
