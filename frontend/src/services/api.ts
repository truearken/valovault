import { Weapon, Agent, OwnedSkinsResponse, LoadoutItemV1, Preset, GunBuddy, ContentTier } from '@/lib/types';
import { LocalClientError } from '@/lib/errors';
import { fetch } from '@tauri-apps/plugin-http';
import { OwnedGunBuddiesResponse } from '../lib/types';

export const LOCAL_URL = "http://localhost:31719/v1"

export async function getHealth(): Promise<boolean> {
    try {
        const response = await fetch(LOCAL_URL + '/health');
        return response.ok;
    } catch {
        return false;
    }
}

export async function getAgents(): Promise<Agent[]> {
    try {
        const response = await fetch('https://valorant-api.com/v1/agents');
        if (!response.ok) {
            throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
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
        return data.data as Weapon[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getGunBuddies(): Promise<GunBuddy[]> {
    try {
        const response = await fetch('https://valorant-api.com/v1/buddies');
        if (!response.ok) {
            throw new Error('Failed to fetch gun buddies');
        }
        const data = await response.json();
        return data.data as GunBuddy[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getContentTiers(): Promise<ContentTier[]> {
    try {
        const response = await fetch('https://valorant-api.com/v1/contenttiers');
        if (!response.ok) {
            throw new Error('Failed to fetch content tiers');
        }
        const data = await response.json();
        return data.data as ContentTier[];
    } catch (error) {
        console.error(error);
        return [];
    }
}


export async function getPlayerLoadout(): Promise<Record<string, LoadoutItemV1>> {
    try {
        const response = await fetch(LOCAL_URL+'/player-loadout');
        if (!response.ok) {
            throw new Error('Failed to fetch player loadout. The local client might not be running or there was a server error.');
        }
        const data = await response.json();
        return data.loadout as Record<string, LoadoutItemV1>;
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getOwnedSkins(): Promise<OwnedSkinsResponse> {
    try {
        const response = await fetch(LOCAL_URL+'/owned-skins');
        if (!response.ok) {
            throw new Error('Failed to fetch owned skins. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getOwnedGunBuddies(): Promise<OwnedGunBuddiesResponse> {
    try {
        const response = await fetch(LOCAL_URL+'/owned-gun-buddies');
        if (!response.ok) {
            throw new Error('Failed to fetch owned gun buddies. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getPresets(): Promise<Preset[]> {
    try {
        const response = await fetch(LOCAL_URL+'/presets');
        if (!response.ok) {
            throw new Error('Failed to fetch presets. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function savePresets(presets: Preset[]): Promise<void> {
    try {
        const response = await fetch(LOCAL_URL+'/presets', {
            method: 'POST',
            body: JSON.stringify(presets),
        });
        if (!response.ok) {
            throw new Error('Failed to save presets. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function applyLoadout(loadout: Record<string, LoadoutItemV1>): Promise<void> {
    try {
        const response = await fetch(LOCAL_URL+'/apply-loadout', {
            method: 'POST',
            body: JSON.stringify(loadout),
        });
        if (!response.ok) {
            throw new Error('Failed to apply loadout. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getLatestReleaseVersion(): Promise<string> {
    try {
        const response = await fetch('https://api.github.com/repos/truearken/valovault/releases/latest');
        if (!response.ok) {
            throw new Error('Failed to fetch latest release');
        }
        const data = await response.json();
        return data.tag_name;
    } catch (error) {
        console.error(error);
        return '';
    }
}
