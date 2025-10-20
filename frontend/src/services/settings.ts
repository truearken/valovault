import { LocalClientError } from "@/lib/errors";
import { fetch } from '@tauri-apps/plugin-http';
import { LOCAL_URL } from "./api";

export type Settings = {
    autoSelectAgent: boolean;
};

export async function getSettings(): Promise<Settings> {
    try {
        const response = await fetch(LOCAL_URL+'/settings');
        if (!response.ok) {
            throw new Error('Failed to fetch settings. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

export async function saveSettings(settings: Settings): Promise<void> {
    try {
        const response = await fetch(LOCAL_URL+'/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
        if (!response.ok) {
            throw new Error('Failed to save settings. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError();
    }
}

