import { LocalClientError } from "@/lib/errors";

export type Settings = {
    autoSelectAgent: boolean;
};

export async function getSettings(): Promise<Settings> {
    try {
        const response = await fetch('http://localhost:8187/v1/settings');
        if (!response.ok) {
            throw new Error('Failed to fetch settings. The local client might not be running or there was a server error.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

export async function saveSettings(settings: Settings): Promise<void> {
    try {
        const response = await fetch('http://localhost:8187/v1/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
        if (!response.ok) {
            throw new Error('Failed to save settings. The local client might not be running or there was a server error.');
        }
    } catch (error) {
        console.error(error);
        throw new LocalClientError('Could not connect to the local client. Please make sure it is running and try again.');
    }
}

