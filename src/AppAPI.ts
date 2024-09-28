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
    game_version: string;
}

export enum ClassicGameAbbreviation 
{
    TD = "td",
    RA = "ra",
    TS = "ts",
    D2 = "d2"
}

export enum CnCNet5Abbreviation 
{
    TD = "cncnet5_td",
    RA = "cncnet5_ra",
    TS = "cncnet5_ts",
    DTA = "cncnet5_dta",
    D2 = "cncnet5_d2",
    YR = "cncnet5_yr",
    MO = "cncnet5_mo",
    PP = "cncnet5_pp",
    RE = "cncnet5_re",
    CNCR = "cncnet5_cncr",
    RR = "cncnet5_rr",
}

export enum CnCNet5GameChannel 
{
    TD = "cncnet-td-games",
    RA = "cncnet-ra-games",
    TS = "cncnet-ts-games",
    YR = "cncnet-yr-games",
    D2 = "cncnet-d2-games",
    DTA = "cncnet-dta-games",
    MO = "cncnet-mo-games",
    PP = "projectphantom-games",
}

interface APIGameDataResponse
{
    games: Game[];
}

export class AppAPI
{
    private baseClassicGameApiUrl: string;
    private baseGamesApiUrl: string;
    private basePlayersApiUrl: string;

    constructor()
    {
        this.baseClassicGameApiUrl = 'https://games-api.cncnet.org/classic';
        this.baseGamesApiUrl = 'https://games-api.cncnet.org/games';
        this.basePlayersApiUrl = 'https://api.cncnet.org/status';
    }

    public async fetchGameData(gameIrcChannel: string): Promise<Game[]>
    {
        try
        {
            let url = `${this.baseGamesApiUrl}?channel=${gameIrcChannel}`;
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

    public async fetchPlayersOnline(abbrev: CnCNet5Abbreviation): Promise<number>
    {
        try
        {
            let url = `${this.basePlayersApiUrl}`;
            console.log("Fetching players online", url, abbrev);

            const response = await fetch(url);
            const responseJson = await response.json() as number;
            return responseJson[abbrev];
        }
        catch (error)
        {
            console.error('Error fetching game data:', error);
            return 0;
        }
    }

    public async fetchClassicClientGames(abbrev: ClassicGameAbbreviation): Promise<number>
    {
        try
        {
            let url = `${this.baseClassicGameApiUrl}?channel=${abbrev}`;
            console.log("Fetching", url);

            const response = await fetch(url);
            const responseJson = await response.json();
            return responseJson[0]["count"];
        }
        catch (error)
        {
            return 0;
        }
    }
}
