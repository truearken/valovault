export interface Agent {
    uuid: string;
    displayName: string;
    displayIcon: string;
}

export interface Preset {
    uuid: string;
    name: string;
    loadout: Record<string, LoadoutItem>; // {[weaponId]: LoadoutItem}
    agents?: string[];
}

export interface LoadoutItem {
    skinId: string;
    skinLevelId: string;
    chromaId: string;
}

export interface Weapon {
    uuid: string;
    defaultSkinUuid: string;
    displayName: string;
    displayIcon: string;
    skins: Skin[];
}

export interface GunBuddy {
    uuid: string;
    isHiddenIfNotOwned: boolean;
    levels: GunBuddyLevel[];
}

export interface Skin {
    uuid: string;
    displayName: string;
    displayIcon: string;
    levels: SkinLevel[];
    chromas: Chroma[];
}

export interface SkinLevel {
    uuid: string;
    displayName: string;
    displayIcon: string;
}

export interface GunBuddyLevel {
    uuid: string;
    displayName: string;
    displayIcon: string;
}

export interface Chroma {
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender: string;
    swatch: string;
}

export interface OwnedSkinsResponse {
    LevelIds: string[];
    ChromaIds: string[];
}

export interface GunBuddy {
	ItemID:     string;
	InstanceID: string;
}

export interface OwnedGunBuddiesResponse {
    GunBuddies: GunBuddy[];
}
