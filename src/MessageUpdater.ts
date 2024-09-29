import { Client, TextChannel, Message, EmbedBuilder } from 'discord.js';
import { Game } from './AppAPI';
import { isatty } from 'tty';

export class MessageUpdater
{
    private client: Client;

    constructor(client: Client)
    {
        this.client = client;
    }

    private createGameEmbed(game: Game, gameLogo: string): EmbedBuilder
    {
        const isAvailable = !game.locked && !game.is_custom_password;
        const embedColor = isAvailable ? "#009700" : "#e77300";

        return new EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({ name: game.host })
            .setTitle(`${game.game_room} ${game.is_custom_password ? '🔑' : ''} ${game.locked ? '🔒' : ''}`)
            .setDescription(`Version: ${game.game_version}`)
            .addFields(
                { name: '🕹️ Game Mode', value: game.game_mode, inline: true },
                { name: '🗺️ Map', value: game.map_name, inline: true },
                { name: `👤 Players (${game.players.split(",").length} / ${game.max_players})`, value: game.players, inline: false }
            )
            .setThumbnail(gameLogo);
    }

    public async updateMessage(
        games: Game[],
        channel: TextChannel,
        gameCount: number,
        playersOnline: number,
        gameName: string,
        gameUrl: string,
        gameDiscordServerUrl?: string
    ): Promise<void>
    {
        try
        {
            const messages = await channel.messages.fetch({ limit: 1 });
            const botMessage = messages.find((msg: Message) => msg.author.id === this.client.user?.id);
            const embeds: EmbedBuilder[] = [];

            // Sort the games so that available games come first
            let availableGames = games.filter((g) => !g.is_custom_password && !g.is_closed && !g.locked);
            let unavailableGames = games.filter((g) => g.is_custom_password || g.is_closed || g.locked);

            let content = `## [${gameName}](${gameUrl})\n`;
            content += `- **Players Online**: ${playersOnline} \n`;
            content += `- **Available Games**: ${availableGames.length} \n`;
            content += `- **In Progress/Locked Games**: ${unavailableGames.length} \n`;

            if (gameDiscordServerUrl)
            {
                content += `- **Discord Server**: [${gameName} Discord](${gameDiscordServerUrl})\n`
            }

            let totalCharacterCount = content.length;
            let remainingGames = availableGames.length;

            for (const game of availableGames)
            {
                const embed = this.createGameEmbed(game);

                const embedCharacterCount = this.calculateEmbedCharacterCount(embed);

                // Check if adding this embed will exceed the 6000 character limit
                if (totalCharacterCount + embedCharacterCount > 6000 || embeds.length >= 10)
                {
                    // If we're at the limit, truncate and add summary text
                    content += `\nand ${remainingGames} more games...`;
                    break;
                }

                embeds.push(embed);
                totalCharacterCount += embedCharacterCount;
                remainingGames--;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            content += `\n_Last updated: <t:${currentTime}:R>_ \n`;

            if (botMessage)
            {
                await botMessage.edit({ content: content, embeds });
            }
            else
            {
                await channel.send({ content: content, embeds });
            }
        }
        catch (error)
        {
            console.error('Error updating or posting message:', error);
        }
    }

    private calculateEmbedCharacterCount(embed: EmbedBuilder): number
    {
        let charCount = 0;

        if (embed.data.title) charCount += embed.data.title.length;
        if (embed.data.description) charCount += embed.data.description.length;
        if (embed.data.footer?.text) charCount += embed.data.footer.text.length;
        if (embed.data.author?.name) charCount += embed.data.author.name.length;

        if (embed.data.fields)
        {
            for (const field of embed.data.fields)
            {
                charCount += (field.name?.length || 0) + (field.value?.length || 0);
            }
        }

        return charCount;
    }
}
