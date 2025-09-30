import { Weapon, Agent, OwnedSkinsResponse, LoadoutItem, Preset } from '@/lib/types';
import { LocalClientError } from '@/lib/errors';

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

export async function getPlayerLoadout(): Promise<Record<string, LoadoutItem>> {
    try {
        const response = await fetch('http://localhost:8187/v1/player-loadout');
        if (!response.ok) {
            throw new Error('Failed to fetch player loadout. The local client might not be running or there was a server error.');
        }
        const data = await response.json();
        return data.Loadout as Record<string, LoadoutItem>;
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

export async function getOwnedSkins(): Promise<OwnedSkinsResponse> {
    try {
        const response = await fetch('http://localhost:8187/v1/owned-skins');
        if (!response.ok) {
            throw new Error('Failed to fetch owned skins. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

export async function getPresets(): Promise<Preset[]> {
    try {
        const response = await fetch('http://localhost:8187/v1/presets');
        if (!response.ok) {
            throw new Error('Failed to fetch presets. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

export async function savePresets(presets: Preset[]): Promise<void> {
    try {
        const response = await fetch('http://localhost:8187/v1/presets', {
            method: 'POST',
            body: JSON.stringify(presets),
        });
        if (!response.ok) {
            throw new Error('Failed to save presets. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

export async function applyLoadout(loadout: Record<string, LoadoutItem>): Promise<void> {
    try {
        const response = await fetch('http://localhost:8187/v1/apply-loadout', {
            method: 'POST',
            body: JSON.stringify(loadout),
        });
        if (!response.ok) {
            throw new Error('Failed to apply loadout. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}
