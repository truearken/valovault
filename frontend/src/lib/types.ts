export interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
}

export interface Preset {
  uuid: string;
  name: string;
  loadout: Record<string, string>; // {[weaponId]: levelId}
  agents?: string[];
}

export interface Weapon {
  uuid: string;
  displayName: string;
  displayIcon: string;
  skins: Skin[];
}

export interface Skin {
  uuid: string;
  displayName: string;
  displayIcon: string;
  levels: SkinLevel[];
}

export interface SkinLevel {
    uuid: string;
    displayName: string;
    displayIcon: string;
}

export interface OwnedSkinsResponse {
  LevelIds: string[];
  ChromaIds: string[];
}
