export interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
}

export interface Preset {
  uuid: string;
  name: string;
  loadout: Record<string, string>; // {[weaponId]: skinId}
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
  SkinIds: string[];
  ChromaIds: string[];
}
