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

    private createGameEmbed(game: Game): EmbedBuilder
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
            .setFooter({ text: `Game ${isAvailable ? 'Open' : 'Closed'}` });
    }

    public async updateMessage(games: Game[], channel: TextChannel, playersOnline: number): Promise<void>
    {
        try
        {
            const messages = await channel.messages.fetch({ limit: 5 });
            const botMessage = messages.find((msg: Message) => msg.author.id === this.client.user?.id);

            let content = `- **Games**: ${games.length} \n`;
            content += `- **Players Online**: ${playersOnline} \n`;

            let remainingGames = games.length;
            let totalCharacterCount = content.length;
            const embeds: EmbedBuilder[] = [];

            // Sort the games so that available games come first
            const sortedGames = games.sort((a, b) =>
            {
                const aAvailable = !a.locked && !a.is_custom_password;
                const bAvailable = !b.locked && !b.is_custom_password;

                // Available games come first
                if (aAvailable && !bAvailable) return -1;
                if (!aAvailable && bAvailable) return 1;
                return 0;  // If both are the same (either both available or both locked), keep their order
            });

            for (const game of sortedGames)
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
