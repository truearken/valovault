"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WeaponGrid from '@/features/gun-skins/WeaponList';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import Footer from '@/components/Footer';
import PresetNameModal from '@/components/PresetNameModal';
import ErrorModal from '@/components/ErrorModal';
import Toast from '@/components/Toast';
import SettingsCard from '@/components/SettingsCard';
import { Preset, Agent, LoadoutItem } from '@/lib/types';
import { getAgents, getPlayerLoadout, applyLoadout, getPresets, savePresets } from '@/services/api';
import { getSettings, saveSettings } from '@/services/settings';
import { LocalClientError } from '@/lib/errors';

const defaultPreset: Preset = {
    uuid: 'default-preset',
    name: 'Current Loadout',
    loadout: {},
    agents: [],
};

export default function Home() {
    const [currentLoadout, setCurrentLoadout] = useState<Record<string, LoadoutItem>>(defaultPreset.loadout);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(defaultPreset);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [originalPreset, setOriginalPreset] = useState<Preset | null>(null);
    const [showPresetNameModal, setShowPresetNameModal] = useState(false);
    const [renamingPreset, setRenamingPreset] = useState<Preset | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [autoSelectAgent, setAutoSelectAgent] = useState(true);


    useEffect(() => {
        async function loadData() {
            try {
                const [fetchedAgents, playerLoadout, fetchedPresets, settings] = await Promise.all([
                    getAgents(), 
                    getPlayerLoadout(),
                    getPresets(),
                    getSettings(),
                ]);
                setAgents(fetchedAgents);
                defaultPreset.loadout = playerLoadout;
                if (Array.isArray(fetchedPresets)) {
                    setPresets(fetchedPresets);
                }

                setAutoSelectAgent(settings.autoSelectAgent);

                setSelectedPreset(defaultPreset);
                setCurrentLoadout(playerLoadout);
            } catch (error) {
                if (error instanceof LocalClientError) {
                    setErrorMessage(error.message);
                    setShowErrorModal(true);
                } else {
                    console.error(error);
                }
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        saveSettings({ autoSelectAgent: autoSelectAgent });
    }, [autoSelectAgent]);

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

    const handleSave = async () => {
        if (!editingPreset || editingPreset.uuid === 'default-preset') return;

        const updatedPresets = presets.map(p =>
            p.uuid === editingPreset.uuid ? editingPreset : p
        );
        setPresets(updatedPresets);
        await savePresets(updatedPresets);
        setSelectedPreset(editingPreset);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleSavePresetName = async (name: string) => {
        if (!name) return;

        if (renamingPreset) {
            // Rename existing preset
            const updatedPresets = presets.map(p => 
                p.uuid === renamingPreset.uuid ? { ...p, name } : p
            );
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
            setRenamingPreset(null);
        } else {
            // Save as new preset
            const newPreset: Preset = {
                uuid: crypto.randomUUID(),
                name,
                loadout: currentLoadout,
                agents: editingPreset?.agents || selectedPreset?.agents || [],
            };
            const updatedPresets = [...presets.filter(p => p.uuid !== 'default-preset'), newPreset];
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
            setSelectedPreset(newPreset);
        }

        setShowPresetNameModal(false);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handlePresetSelect = async (preset: Preset) => {
        if (preset.uuid === 'default-preset') {
            try {
                const playerLoadout = await getPlayerLoadout();
                defaultPreset.loadout = playerLoadout;
                setCurrentLoadout(playerLoadout);
            } catch (error) {
                if (error instanceof LocalClientError) {
                    setErrorMessage(error.message);
                    setShowErrorModal(true);
                } else {
                    console.error(error);
                }
            }
        } else {
            setCurrentLoadout(preset.loadout);
        }

        setSelectedPreset(preset);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handlePresetApply = async (preset: Preset) => {
        try {
            await applyLoadout(preset.loadout);
            setToastMessage(`Successfully applied preset "${preset.name}".`);
            setShowToast(true);
        } catch (error) {
            if (error instanceof LocalClientError) {
                setErrorMessage(error.message);
                setShowErrorModal(true);
            } else {
                console.error(error);
            }
        }
    };

    const handleApply = async () => {
        const presetToApply = editingPreset || selectedPreset;
        if (!presetToApply) return;

        // Save first if it's a modified existing preset
        if (editingPreset && editingPreset.uuid !== 'default-preset') {
            const updatedPresets = presets.map(p =>
                p.uuid === editingPreset.uuid ? editingPreset : p
            );
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
            setSelectedPreset(editingPreset);
        } else if (originalPreset) {
            // This handles the case where we were editing the default preset
            setSelectedPreset(originalPreset);
        }

        try {
            await applyLoadout(currentLoadout);
            setToastMessage(`Successfully applied ${presetToApply.name}.`);
            setShowToast(true);
        } catch (error) { 
            if (error instanceof LocalClientError) {
                setErrorMessage(error.message);
                setShowErrorModal(true);
            } else {
                console.error(error);
            }
        }

        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handlePresetDelete = async (presetId: string) => {
        if (window.confirm('Are you sure you want to delete this preset?')) {
            const updatedPresets = presets.filter(p => p.uuid !== presetId);
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
        }
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
        setRenamingPreset(null);
        setShowPresetNameModal(true);
    };

    const handleOpenRenameModal = (preset: Preset) => {
        setRenamingPreset(preset);
        setShowPresetNameModal(true);
    };

    const handleClosePresetNameModal = () => {
        setShowPresetNameModal(false);
        setRenamingPreset(null);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
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
                    <div className="col-md-8 scrollable-col">
                        <div className="p-3 border bg-light">
                            <h2>Weapon Skins</h2>
                            <p>Select a weapon to see available skins.</p>
                            <WeaponGrid onSkinSelect={handleSkinSelect} currentLoadout={currentLoadout} />
                        </div>
                        {(() => {
                            const activePreset = editingPreset || selectedPreset;
                            if (activePreset && activePreset.uuid !== 'default-preset') {
                                return (
                                    <AgentAssigner
                                        agents={agents}
                                        selectedPreset={activePreset}
                                        assignedAgents={activePreset.agents || []}
                                        onAssignmentChange={handleAgentAssignment}
                                    />
                                );
                            }
                            return null;
                        })()}
                    </div>
                    <div className="col-md-4 scrollable-col">
                        <SettingsCard autoSelectAgent={autoSelectAgent} onAutoSelectAgentChange={setAutoSelectAgent} />
                        <div className="p-3 border bg-light mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="mb-0">Presets</h2>
                                <button className="btn btn-primary" onClick={handleOpenPresetNameModal}>+</button>
                            </div>
                            <PresetList presets={presets} onPresetSelect={handlePresetSelect} selectedPreset={selectedPreset} defaultPreset={defaultPreset} onPresetApply={handlePresetApply} onPresetDelete={handlePresetDelete} onPresetRename={handleOpenRenameModal} agents={agents} />
                        </div>
                    </div>
                </div>
            </main>
            {isEditing && <Footer onSave={handleSave} onCancel={handleCancel} onSaveAsNew={handleOpenPresetNameModal} onApply={handleApply} showSaveButton={originalPreset?.uuid !== 'default-preset'} />}
            <PresetNameModal show={showPresetNameModal} onClose={handleClosePresetNameModal} onSave={handleSavePresetName} initialName={renamingPreset?.name} />
            <ErrorModal show={showErrorModal} onClose={handleCloseErrorModal} message={errorMessage} />
            <Toast show={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
        </>
    );
}
