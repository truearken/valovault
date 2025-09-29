"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WeaponGrid from '@/features/gun-skins/WeaponList';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import Footer from '@/components/Footer';
import PresetNameModal from '@/components/PresetNameModal';
import InfoModal from '@/components/InfoModal';
import { Preset, Agent, LoadoutItem } from '@/lib/types';
import { getAgents, getPlayerLoadout } from '@/services/api';
import { LocalClientError } from '@/lib/errors';

const defaultPreset: Preset = {
    uuid: 'default-preset',
    name: 'Current Loadout',
    loadout: {},
    agents: [],
};

export default function Home() {
    const [currentLoadout, setCurrentLoadout] = useState<Record<string, LoadoutItem>>(defaultPreset.loadout);
    const [presets, setPresets] = useState<Preset[]>([defaultPreset]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(defaultPreset);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [originalPreset, setOriginalPreset] = useState<Preset | null>(null);
    const [showPresetNameModal, setShowPresetNameModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalMessage, setInfoModalMessage] = useState('');


    useEffect(() => {
        const savedPresets = localStorage.getItem('valovault-presets');
        if (savedPresets) {
            setPresets(JSON.parse(savedPresets));
        }

        async function loadData() {
            try {
                const [fetchedAgents, playerLoadout] = await Promise.all([
                    getAgents(), 
                    getPlayerLoadout()
                ]);
                setAgents(fetchedAgents);
                defaultPreset.loadout = playerLoadout;

                // If there are no saved presets, use the default one
                if (!savedPresets) {
                    setPresets([defaultPreset]);
                }
                setSelectedPreset(defaultPreset);
                setCurrentLoadout(playerLoadout);
            } catch (error) {
                if (error instanceof LocalClientError) {
                    setInfoModalMessage(error.message);
                    setShowInfoModal(true);
                } else {
                    console.error(error);
                }
            }
        }
        loadData();
    }, []);

    const handleSkinSelect = (weaponId: string, skinId: string, levelId: string, chromaId: string) => {
        const newLoadoutItem: LoadoutItem = { skinId, skinLevelId: levelId, chromaId };

        if (editingPreset) {
            const newLoadout = { ...editingPreset.loadout, [weaponId]: newLoadoutItem };
            setEditingPreset({ ...editingPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
        } else if (selectedPreset) {
            setIsEditing(true);
            setOriginalPreset(selectedPreset);
            const newLoadout = { ...selectedPreset.loadout, [weaponId]: newLoadoutItem };
            setEditingPreset({ ...selectedPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
            setSelectedPreset(null);
        } else {
            setCurrentLoadout(prev => ({ ...prev, [weaponId]: newLoadoutItem }));
        }
    };

    const handleSave = () => {
        if (!editingPreset) return;

        const updatedPresets = presets.map(p =>
            p.uuid === editingPreset.uuid ? editingPreset : p
        );
        setPresets(updatedPresets);
        localStorage.setItem('valovault-presets', JSON.stringify(updatedPresets));
        setSelectedPreset(editingPreset);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleSaveAsNew = (name: string) => {
        if (!name) return;
        const newPreset: Preset = {
            uuid: crypto.randomUUID(),
            name,
            loadout: currentLoadout,
            agents: editingPreset?.agents || selectedPreset?.agents || [],
        };
        const updatedPresets = [...presets, newPreset];
        setPresets(updatedPresets);
        localStorage.setItem('valovault-presets', JSON.stringify(updatedPresets));
        setShowPresetNameModal(false);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
        setSelectedPreset(newPreset);
    };

    


    const handlePresetSelect = (preset: Preset) => {
        setCurrentLoadout(preset.loadout);
        setSelectedPreset(preset);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleCancel = () => {
        if (originalPreset) {
            setSelectedPreset(originalPreset);
            setCurrentLoadout(originalPreset.loadout);
        }
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleOpenPresetNameModal = () => {
        setShowPresetNameModal(true);
    };

    const handleClosePresetNameModal = () => {
        setShowPresetNameModal(false);
    };

    const handleCloseInfoModal = () => {
        setShowInfoModal(false);
    };

    const handleAgentAssignment = (agentId: string, isAssigned: boolean) => {
        if (!isEditing) {
            setIsEditing(true);
            setOriginalPreset(selectedPreset);
            setEditingPreset(selectedPreset);
            setSelectedPreset(null);
        }

        setEditingPreset(prev => {
            if (!prev) return null;
            const updatedAgents = isAssigned
                ? [...(prev.agents || []), agentId]
                : (prev.agents || []).filter(id => id !== agentId);
            return { ...prev, agents: updatedAgents };
        });
    };

    return (
        <>
            <Header
                isEditing={isEditing}
            />
            <main className="container-fluid mt-4 pb-5 h-100">
                <div className="row h-100">
                    <div className="col-md-8">
                        <div className="p-3 border bg-light">
                            <h2>Weapon Skins</h2>
                            <p>Select a weapon to see available skins.</p>
                            <WeaponGrid onSkinSelect={handleSkinSelect} currentLoadout={currentLoadout} />
                        </div>
                        {(selectedPreset || editingPreset) && (
                            <AgentAssigner
                                agents={agents}
                                selectedPreset={selectedPreset || editingPreset!}
                                assignedAgents={(selectedPreset || editingPreset)?.agents || []}
                                onAssignmentChange={handleAgentAssignment}
                            />
                        )}
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 border bg-light mb-3">
                            <h2>Presets</h2>
                            <PresetList presets={presets} onPresetSelect={handlePresetSelect} selectedPreset={selectedPreset} />
                        </div>
                    </div>
                </div>
            </main>
            {isEditing && <Footer onSave={handleSave} onCancel={handleCancel} onSaveAsNew={handleOpenPresetNameModal} showSaveButton={originalPreset?.uuid !== 'default-preset'} />}
            <PresetNameModal show={showPresetNameModal} onClose={handleClosePresetNameModal} onSave={handleSaveAsNew} />
            <InfoModal show={showInfoModal} onClose={handleCloseInfoModal} message={infoModalMessage} />
        </>
    );
}
