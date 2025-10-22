"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent, Weapon, GunBuddy, ContentTier } from '@/lib/types';
import { getAgents, getWeapons, getGunBuddies, getContentTiers } from '@/services/api';

interface DataContextType {
    agents: Agent[];
    weapons: Weapon[];
    gunBuddies: GunBuddy[];
    contentTiers: ContentTier[];
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [gunBuddies, setGunBuddies] = useState<GunBuddy[]>([]);
    const [contentTiers, setContentTiers] = useState<ContentTier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [agentsData, weaponsData, gunBuddiesData, contentTiersData] = await Promise.all([
                    getAgents(),
                    getWeapons(),
                    getGunBuddies(),
                    getContentTiers(),
                ]);
                setAgents(agentsData);
                setWeapons(weaponsData);
                setGunBuddies(gunBuddiesData);
                setContentTiers(contentTiersData);
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ agents, weapons, gunBuddies, contentTiers, loading }}>
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
