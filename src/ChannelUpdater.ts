import { Client, TextChannel } from 'discord.js';

export class ChannelUpdater
{
    private lastGameCount: { [channelId: string]: number } = {};

    constructor(private client: Client) { }

    public async updateChannelName(gamesCount: number, channel: TextChannel): Promise<void>
    {
        const channelId = channel.id;

        // Only update if the game count has changed
        if (this.lastGameCount[channelId] !== gamesCount)
        {
            try
            {
                await channel.setName(`games-${gamesCount}`);
                console.log(`Channel name updated to games-${gamesCount}`);
                this.lastGameCount[channelId] = gamesCount;
            }
            catch (error)
            {
                console.error('Error updating channel name:', error);
            }
        }
    }
}
