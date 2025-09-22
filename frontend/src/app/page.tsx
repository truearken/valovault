"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WeaponGrid from '@/features/gun-skins/WeaponList';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import Footer from '@/components/Footer';
import PresetNameModal from '@/components/PresetNameModal';
import { Preset, Agent } from '@/lib/types';
import { getAgents, getPlayerLoadout } from '@/services/api';

const defaultPreset: Preset = {
    uuid: 'default-preset',
    name: 'Default',
    loadout: {},
    agents: [],
};

export default function Home() {
    const [currentLoadout, setCurrentLoadout] = useState<Record<string, string>>(defaultPreset.loadout);
    const [presets, setPresets] = useState<Preset[]>([defaultPreset]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(defaultPreset);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [originalPreset, setOriginalPreset] = useState<Preset | null>(null);
    const [showPresetNameModal, setShowPresetNameModal] = useState(false);


    useEffect(() => {
        async function loadData() {
            const fetchedAgents = await getAgents();
            setAgents(fetchedAgents);

            const playerLoadout = await getPlayerLoadout();
            defaultPreset.loadout = playerLoadout;
            setPresets([defaultPreset]);
            setSelectedPreset(defaultPreset);
            setCurrentLoadout(defaultPreset.loadout);
        }
        loadData();
    }, []);

    const handleSkinSelect = (weaponId: string, skinId: string) => {
        if (editingPreset) {
            const newLoadout = { ...editingPreset.loadout, [weaponId]: skinId };
            setEditingPreset({ ...editingPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
        } else if (selectedPreset) {
            setIsEditing(true);
            setOriginalPreset(selectedPreset);
            const newLoadout = { ...selectedPreset.loadout, [weaponId]: skinId };
            setEditingPreset({ ...selectedPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
            setSelectedPreset(null);
        } else {
            setCurrentLoadout(prev => ({ ...prev, [weaponId]: skinId }));
        }
    };



    const handlePresetSelect = (preset: Preset) => {
        setCurrentLoadout(preset.loadout);
        setSelectedPreset(preset);
        setIsEditing(false); // Reset editing state when a new preset is selected
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleSave = () => {
        if (!editingPreset) return;

        const updatedPresets = presets.map(p =>
            p.uuid === editingPreset.uuid ? editingPreset : p
        );
        setPresets(updatedPresets);
        setSelectedPreset(editingPreset);
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

    const handleSaveAsNew = (name: string) => {
        if (!name) return;
        const newPreset: Preset = {
            uuid: crypto.randomUUID(),
            name,
            loadout: currentLoadout,
            agents: editingPreset?.agents || selectedPreset?.agents || [],
        };
        setPresets(prev => [...prev, newPreset]);
        setShowPresetNameModal(false);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
        setSelectedPreset(newPreset);
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
            {isEditing && <Footer onSave={handleSave} onCancel={handleCancel} onSaveAsNew={handleOpenPresetNameModal} />}
            <PresetNameModal show={showPresetNameModal} onClose={handleClosePresetNameModal} onSave={handleSaveAsNew} />
        </>
    );
}
