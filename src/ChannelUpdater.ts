import { Client, TextChannel } from 'discord.js';

export class ChannelUpdater
{
    private client: Client;

    constructor(client: Client)
    {
        this.client = client;
    }

    public async updateChannelName(gamesCount: number, channel: TextChannel): Promise<void>
    {
        try
        {
            await channel.setName(`games-${gamesCount}`);
            console.log(`Channel name updated to games-${gamesCount}`);
        }
        catch (error)
        {
            console.error('Error updating channel name:', error);
        }
    }
}
