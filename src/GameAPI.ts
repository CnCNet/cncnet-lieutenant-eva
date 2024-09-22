import fetch from 'node-fetch';

export interface Game
{
    game_room: string;
    host: string;
    map_name: string;
    max_players: number;
    locked: boolean;
    is_custom_password: boolean;
    is_closed: boolean;
    players: string;
    game_mode: string;
}

interface APIGameDataResponse
{
    games: Game[];
}

export class GameAPI
{
    private baseApiUrl: string;

    constructor()
    {
        this.baseApiUrl = 'https://games-api.cncnet.org/games';
    }

    public async fetchGameData(gameIrcChannel: string): Promise<Game[]>
    {
        try
        {
            let url = `${this.baseApiUrl}?channel=${gameIrcChannel}`;
            console.log("Fetching", url);

            const response = await fetch(url);
            const data = await response.json() as APIGameDataResponse;
            return data.games;
        }
        catch (error)
        {
            console.error('Error fetching game data:', error);
            return [];
        }
    }
}
