import { Weapon, Agent, OwnedSkinsResponse } from '@/lib/types';

export async function getAgents(): Promise<Agent[]> {
    try {
        const response = await fetch('https://valorant-api.com/v1/agents');
        if (!response.ok) {
            throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        // The API returns data in a `data` property
        return data.data.filter((agent: Agent) => agent.displayIcon);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getWeapons(): Promise<Weapon[]> {
    try {
        const response = await fetch('https://valorant-api.com/v1/weapons');
        if (!response.ok) {
            throw new Error('Failed to fetch weapons');
        }
        const data = await response.json();
        // The API returns data in a `data` property
        return data.data as Weapon[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getOwnedSkins(): Promise<OwnedSkinsResponse> {
    let data = {} as OwnedSkinsResponse;

    try {
        const response = await fetch('http://localhost:8187/owned-skins');
        if (!response.ok) {
            // It's possible the local client isn't running, so don't throw an error
            console.warn('Failed to fetch owned items. Is the local client running?');
            return data;
        }
        data = await response.json();

    } catch (error) {
        console.error('Error fetching owned items:', error);
    }
    return data;
}
