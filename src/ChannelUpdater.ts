import { Client, TextChannel } from 'discord.js';

export class ChannelUpdater
{
    private lastGameCount: { [channelId: string]: number } = {};

    constructor(private client: Client) { }

    public async updateChannelName(gamesCount: number, channel: TextChannel): Promise<void>
    {
        const channelId = channel.id;

        console.log(this.lastGameCount);

        // Only update if the game count has changed
        if (this.lastGameCount[channelId] !== gamesCount)
        {
            try
            {
                let currentChannelName: string = channel.name;

                // Remove existing games count suffix, if any
                let baseChannelName = currentChannelName.replace(/-\d+$/, '');

                // Append the new games count
                baseChannelName += `-${gamesCount}`;

                await channel.setName(baseChannelName);

                console.log(`Channel name updated to ${baseChannelName}`);

                this.lastGameCount[channelId] = gamesCount;
            }
            catch (error)
            {
                console.error('Error updating channel name:', error);
            }
        }
    }

}
