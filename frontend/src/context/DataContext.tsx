"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Agent, Weapon, GunBuddy, ContentTier } from '@/lib/types';
import { getAgents, getWeapons, getGunBuddies, getContentTiers, getOwnedSkins, getOwnedGunBuddies, getHealth, getOwnedAgents } from '@/services/api';
import { LocalClientError } from '@/lib/errors';

interface DataContextType {
    agents: Agent[];
    weapons: Weapon[];
    ownedBuddies: GunBuddy[];
    contentTiers: ContentTier[];
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    ownedBuddyIDs: string[];
    loading: boolean;
    isClientHealthy: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [ownedBuddies, setOwnedBuddies] = useState<GunBuddy[]>([]);
    const [contentTiers, setContentTiers] = useState<ContentTier[]>([]);
    const [ownedLevelIDs, setOwnedLevelIDs] = useState<string[]>([]);
    const [ownedChromaIDs, setOwnedChromaIDs] = useState<string[]>([]);
    const [ownedBuddyIDs, setOwnedBuddyIDs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClientHealthy, setIsClientHealthy] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [agentsData, weaponsData, gunBuddiesData, contentTiersData, ownedSkins, ownedGunBuddies, ownedAgents] = await Promise.all([
                getAgents(),
                getWeapons(),
                getGunBuddies(),
                getContentTiers(),
                getOwnedSkins(),
                getOwnedGunBuddies(),
                getOwnedAgents(),
            ]);

            const ownedAgentDetails = agentsData.filter(a => ownedAgents.AgentIds.includes(a.uuid) || a.isBaseContent)
            setAgents(ownedAgentDetails);

            setWeapons(weaponsData);
            setContentTiers(contentTiersData);

            const levels = ownedSkins.LevelIds;
            for (const gun of weaponsData) {
                const defaultSkin = gun.skins.find(s => s.uuid == gun.defaultSkinUuid)!;
                levels.push(defaultSkin.levels[0].uuid)
            }
            setOwnedLevelIDs(levels);
            setOwnedChromaIDs(ownedSkins.ChromaIds);
            setOwnedBuddyIDs(ownedGunBuddies.LevelIds);

            const ownedBuddyDetails = gunBuddiesData.filter(b => ownedGunBuddies.LevelIds.includes(b.levels[0].uuid));
            setOwnedBuddies(ownedBuddyDetails);
            setLoading(false);
        } catch (error) {
            if (error instanceof LocalClientError) {
                setLoading(true);
            } else {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const healthCheck = async () => {
            const isHealthy = await getHealth();
            setIsClientHealthy(isHealthy);
            if (isHealthy) {
                if (loading) {
                    loadData();
                }
            } else {
                if (!loading) {
                    setLoading(true);
                }
            }
        };

        healthCheck();
        const intervalId = setInterval(healthCheck, 3000);

        return () => clearInterval(intervalId);
    }, [loading, loadData]);

    return (
        <DataContext.Provider value={{ agents, weapons, ownedBuddies, contentTiers, ownedLevelIDs, ownedChromaIDs, ownedBuddyIDs, loading, isClientHealthy }}>
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
