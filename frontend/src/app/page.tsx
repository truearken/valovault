"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import WeaponGrid from '@/features/gun-skins/WeaponGrid';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import Footer from '@/components/Footer';
import PresetNameModal from '@/components/PresetNameModal';
import ErrorModal from '@/components/ErrorModal';
import Toast from '@/components/Toast';
import SettingsCard from '@/components/SettingsCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Preset, LoadoutItemV1 } from '@/lib/types';
import { getPlayerLoadout, applyLoadout, getPresets, savePresets } from '@/services/api';
import { getSettings, saveSettings } from '@/services/settings';
import { LocalClientError } from '@/lib/errors';
import { useData } from '@/context/DataContext';

const DEFAULT_PRESET_ID = 'default-preset';

const defaultPreset: Preset = {
    uuid: DEFAULT_PRESET_ID,
    name: 'Current Loadout',
    loadout: {},
    agents: [],
};

enum NamingMode {
    New,
    SaveAsNew,
    Rename,
    Variant
}

export default function Home() {
    const { agents, loading: dataContextLoading, isClientHealthy } = useData();
    const [currentLoadout, setCurrentLoadout] = useState<Record<string, LoadoutItemV1>>(defaultPreset.loadout);
    const [presets, setPresets] = useState<Preset[]>([]);
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
    const [autoSelectAgent, setAutoSelectAgent] = useState<boolean>();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading application data...');
    const [namingMode, setNamingMode] = useState(NamingMode.New);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [presetToDelete, setPresetToDelete] = useState<string | null>(null);


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [playerLoadout, fetchedPresets, settings] = await Promise.all([
                getPlayerLoadout(),
                getPresets(),
                getSettings(),
            ]);
            defaultPreset.loadout = playerLoadout;
            if (Array.isArray(fetchedPresets)) {
                setPresets(fetchedPresets);
            }

            setAutoSelectAgent(settings.autoSelectAgent);

            setSelectedPreset(defaultPreset);
            setCurrentLoadout(playerLoadout);
            setIsLoading(false);
        } catch (error) {
            if (error instanceof LocalClientError) {
                setIsLoading(true);
            } else {
                console.error(error);
                setErrorMessage("An unexpected error occurred while loading data.");
                setShowErrorModal(true);
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (isClientHealthy) {
            setLoadingMessage('Loading application data...');
            loadData();
        } else {
            setIsLoading(true);
            setLoadingMessage("Waiting for VALORANT to start...");
        }
    }, [isClientHealthy, loadData]);

    useEffect(() => {
        if (autoSelectAgent !== undefined) {
            saveSettings({ autoSelectAgent: autoSelectAgent });
        }
    }, [autoSelectAgent]);

    const handleSkinSelect = (weaponId: string, skinId: string, levelId: string, chromaId: string) => {
        const existingItem = (editingPreset?.loadout[weaponId] || currentLoadout[weaponId]);
        const newLoadoutItem: LoadoutItemV1 = { ...existingItem, skinId, skinLevelId: levelId, chromaId };

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

    const handleBuddySelect = (weaponId: string, charmID: string, charmLevelID: string) => {
        const existingItem = (editingPreset?.loadout[weaponId] || currentLoadout[weaponId]);
        const newLoadoutItem: LoadoutItemV1 = { ...existingItem, charmID, charmLevelID };

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
        if (!editingPreset || editingPreset.uuid === DEFAULT_PRESET_ID) return;

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

        const newPreset: Preset = {
            uuid: crypto.randomUUID(),
            name,
            loadout: {},
            agents: [],
        };

        switch (namingMode) {
            case NamingMode.Rename:
                const updatedPresets = presets.map(p =>
                    p.uuid === renamingPreset!.uuid ? { ...p, name } : p
                );
                setPresets(updatedPresets);
                await savePresets(updatedPresets);
                setRenamingPreset(null);
                setShowPresetNameModal(false);
                return;
            case NamingMode.New:
                newPreset.loadout = defaultPreset.loadout;
                newPreset.agents = [];
                break;
            case NamingMode.SaveAsNew:
                newPreset.loadout = currentLoadout;
                newPreset.agents = editingPreset?.agents || originalPreset?.agents || [];
                break;
            case NamingMode.Variant:
                newPreset.parentUuid = editingPreset!.uuid || originalPreset!.uuid;
                const edited: Record<string, LoadoutItemV1> = {};
                for (const [gun, item] of Object.entries(editingPreset!.loadout)) {
                    const originalGun = originalPreset!.loadout[gun]
                    const wasEdited = originalGun.chromaId != item.chromaId || originalGun.skinLevelId != item.skinLevelId;
                    if (wasEdited) {
                        edited[gun] = item;
                    }
                }
                newPreset.loadout = edited;
                break;
        }

        const updatedPresets = [...presets.filter(p => p.uuid !== DEFAULT_PRESET_ID), newPreset];
        setPresets(updatedPresets);
        await savePresets(updatedPresets);
        setSelectedPreset(newPreset);
        setCurrentLoadout(newPreset.loadout);

        setShowPresetNameModal(false);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handlePresetSelect = async (preset: Preset) => {
        if (preset.uuid === DEFAULT_PRESET_ID) {
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
        if (editingPreset && editingPreset.uuid !== DEFAULT_PRESET_ID) {
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
            }
        } finally {
            setIsEditing(false);
            setEditingPreset(null);
            setOriginalPreset(null);
        }
    };

    const handlePresetDelete = (presetId: string) => {
        setPresetToDelete(presetId);
        setShowConfirmationModal(true);
    };

    const handleConfirmDelete = async () => {
        if (presetToDelete) {
            const updatedPresets = presets.filter(p => p.uuid !== presetToDelete);
            setPresets(updatedPresets);
            await savePresets(updatedPresets);
            if (presetToDelete === selectedPreset?.uuid) {
                setSelectedPreset(defaultPreset);
                setCurrentLoadout(defaultPreset.loadout);
            }
            setPresetToDelete(null);
        }
        setShowConfirmationModal(false);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
        setPresetToDelete(null);
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

    const handleOpenPresetNameModal = (mode: NamingMode) => {
        setNamingMode(mode);
        setShowPresetNameModal(true);
    };

    const handleOpenRenameModal = (preset: Preset) => {
        setNamingMode(NamingMode.Rename)
        setRenamingPreset(preset);
        setShowPresetNameModal(true);
    };

    const handleVariant = () => {
        setNamingMode(NamingMode.Variant)
        setShowPresetNameModal(true);
    }

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

    if (isLoading || dataContextLoading) {
        return (
            <>
                <Header />
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">{loadingMessage}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container-fluid mt-4 pb-5 h-100">
                <div className="row h-100">
                    <div className="col-md-8 mb-3 scrollable-col">
                        <div className="p-3 border">
                            <h2>Weapon Skins</h2>
                            <p>Select a weapon to see available skins.</p>
                            <WeaponGrid onSkinSelectAction={handleSkinSelect} onBuddySelectAction={handleBuddySelect} currentLoadout={currentLoadout} parent={presets.find(p => p.uuid == selectedPreset?.parentUuid)?.loadout} />
                        </div>
                        {(() => {
                            const activePreset = editingPreset || selectedPreset;
                            if (activePreset && activePreset.uuid !== DEFAULT_PRESET_ID) {
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
                        <SettingsCard autoSelectAgent={autoSelectAgent} onAutoSelectAgentChange={setAutoSelectAgent} isLoading={isLoading} />
                        <div className="p-3 border mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="mb-0">Presets</h2>
                                <button className="btn btn-primary" onClick={() => handleOpenPresetNameModal(NamingMode.New)}>+</button>
                            </div>
                            <PresetList presets={presets} onPresetSelect={handlePresetSelect}
                                selectedPreset={selectedPreset} defaultPreset={defaultPreset}
                                onPresetApply={handlePresetApply} onPresetDelete={handlePresetDelete}
                                onPresetRename={handleOpenRenameModal} agents={agents} />
                        </div>
                    </div>
                </div>
            </main>
            {isEditing && <Footer onSaveAction={handleSave} onCancelAction={handleCancel}
                onSaveAsNewAction={() => handleOpenPresetNameModal(NamingMode.SaveAsNew)}
                onApplyAction={handleApply} onVariantAction={handleVariant}
                isDefaultPreset={originalPreset?.uuid === DEFAULT_PRESET_ID} />}
            <PresetNameModal show={showPresetNameModal} onCloseAction={handleClosePresetNameModal} onSaveAction={handleSavePresetName} initialName={renamingPreset?.name} />
            <ErrorModal show={showErrorModal} onClose={handleCloseErrorModal} message={errorMessage} />
            <Toast show={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
            <ConfirmationModal
                show={showConfirmationModal}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmDelete}
                title="Delete Preset"
                message="Are you sure you want to delete this preset?"
            />
        </>
    );
}
