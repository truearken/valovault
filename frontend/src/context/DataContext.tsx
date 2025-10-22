"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent, Weapon, GunBuddy, ContentTier } from '@/lib/types';
import { getAgents, getWeapons, getGunBuddies, getContentTiers, getOwnedSkins, getOwnedGunBuddies } from '@/services/api';

interface DataContextType {
    agents: Agent[];
    weapons: Weapon[];
    allBuddies: GunBuddy[];
    contentTiers: ContentTier[];
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    ownedBuddyIDs: string[];
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [gunBuddies, setGunBuddies] = useState<GunBuddy[]>([]);
    const [contentTiers, setContentTiers] = useState<ContentTier[]>([]);
    const [ownedLevelIDs, setOwnedLevelIDs] = useState<string[]>([]);
    const [ownedChromaIDs, setOwnedChromaIDs] = useState<string[]>([]);
    const [ownedBuddyIDs, setOwnedBuddyIDs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [agentsData, weaponsData, gunBuddiesData, contentTiersData, ownedSkins, ownedGunBuddies] = await Promise.all([
                    getAgents(),
                    getWeapons(),
                    getGunBuddies(),
                    getContentTiers(),
                    getOwnedSkins(),
                    getOwnedGunBuddies(),
                ]);
                setAgents(agentsData);
                setWeapons(weaponsData);
                setGunBuddies(gunBuddiesData);
                setContentTiers(contentTiersData);

                const levels = ownedSkins.LevelIds;
                for (const gun of weaponsData) {
                    const defaultSkin = gun.skins.find(s => s.uuid == gun.defaultSkinUuid)!;
                    levels.push(defaultSkin.levels[0].uuid)
                }
                setOwnedLevelIDs(levels);
                setOwnedChromaIDs(ownedSkins.ChromaIds);
                setOwnedBuddyIDs(ownedGunBuddies.LevelIds);

            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ agents, weapons, allBuddies: gunBuddies, contentTiers, ownedLevelIDs, ownedChromaIDs, ownedBuddyIDs, loading }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
