import { Weapon, Agent, OwnedSkinsResponse, LoadoutItemV1, Preset, GunBuddy, ContentTier, OwnedGunBuddiesResponse, OwnedAgentsResponse  } from '@/lib/types';
import { LocalClientError, ApiError } from '@/lib/errors';
import { fetch } from '@tauri-apps/plugin-http';

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
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to fetch player loadout');
        }
        const data = await response.json();
        return data.loadout as Record<string, LoadoutItemV1>;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getOwnedSkins(): Promise<OwnedSkinsResponse> {
    try {
        const response = await fetch(LOCAL_URL+'/owned-skins');
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to fetch owned skins');
        }
        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getOwnedGunBuddies(): Promise<OwnedGunBuddiesResponse> {
    try {
        const response = await fetch(LOCAL_URL+'/owned-gun-buddies');
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to fetch owned gun buddies');
        }
        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getOwnedAgents(): Promise<OwnedAgentsResponse> {
    try {
        const response = await fetch(LOCAL_URL+'/owned-agents');
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to fetch owned agents');
        }
        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(error);
        throw new LocalClientError();
    }
}

export async function getPresets(): Promise<Preset[]> {
    try {
        const response = await fetch(LOCAL_URL+'/presets');
        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to fetch presets');
        }
        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
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
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to save presets');
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
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
            const errorText = await response.text();
            throw new ApiError(errorText || 'Failed to apply loadout');
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error(error);
        throw new LocalClientError();
    }
}
