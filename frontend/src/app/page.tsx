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
import { getPlayerLoadout, getPresets } from '@/services/api';
import { getSettings, saveSettings } from '@/services/settings';
import { LocalClientError } from '@/lib/errors';
import { Preset, LoadoutItemV1 } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { usePresets, NamingMode, defaultPreset } from '@/hooks/usePresets';
import { useLoadout } from '@/hooks/useLoadout';

export default function Home() {
    const { agents, loading: dataContextLoading, isClientHealthy } = useData();
    const [initialData, setInitialData] = useState<{ presets: Preset[], playerLoadout: Record<string, LoadoutItemV1> }>({ presets: [], playerLoadout: {} });
    const [autoSelectAgent, setAutoSelectAgent] = useState<boolean>();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading application data...');

    const {
        showErrorModal,
        errorMessage,
        handleApplyLoadout,
        handleCloseErrorModal,
        showToast,
        toastMessage,
        handleCloseToast,
        setShowErrorModal,
        setErrorMessage
    } = useLoadout();

    const {
        presets,
        selectedPreset,
        isEditing,
        editingPreset,
        originalPreset,
        showPresetNameModal,
        renamingPreset,
        showConfirmationModal,
        currentLoadout,
        handleSave,
        handleSavePresetName,
        handlePresetSelect,
        handlePresetDelete,
        handleConfirmDelete,
        handleCloseConfirmationModal,
        handleCancel,
        handleOpenPresetNameModal,
        handleOpenRenameModal,
        handleVariant,
        handleClosePresetNameModal,
        handleAgentAssignment,
        handleItemChange
    } = usePresets(initialData.presets, initialData.playerLoadout, (error) => {
        if (error instanceof LocalClientError) {
            setErrorMessage(error.message);
            setShowErrorModal(true);
        } else {
            console.error(error);
        }
    });

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [playerLoadout, fetchedPresets, settings] = await Promise.all([
                getPlayerLoadout(),
                getPresets(),
                getSettings(),
            ]);
            setInitialData({ playerLoadout, presets: Array.isArray(fetchedPresets) ? fetchedPresets : [] });
            setAutoSelectAgent(settings.autoSelectAgent);
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
    }, [setErrorMessage, setShowErrorModal]);

    useEffect(() => {
        if (isClientHealthy) {
            setLoadingMessage('Loading application data...');
            loadInitialData();
        } else {
            setIsLoading(true);
            setLoadingMessage("Waiting for VALORANT to start...");
        }
    }, [isClientHealthy, loadInitialData]);

    useEffect(() => {
        if (autoSelectAgent !== undefined) {
            saveSettings({ autoSelectAgent: autoSelectAgent });
        }
    }, [autoSelectAgent]);

    const handleSkinSelect = (weaponId: string, skinId: string, levelId: string, chromaId: string) => {
        handleItemChange(weaponId, { skinId, skinLevelId: levelId, chromaId });
    };

    const handleBuddySelect = (weaponId: string, charmID: string, charmLevelID: string) => {
        handleItemChange(weaponId, { charmID, charmLevelID });
    };

    const handleApply = async () => {
        const presetToApply = editingPreset || selectedPreset;
        if (!presetToApply) return;

        if (isEditing && editingPreset && editingPreset.uuid !== defaultPreset.uuid) {
            await handleSave();
        }

        await handleApplyLoadout(currentLoadout, presetToApply.name);

        if (isEditing) {
            handleCancel();
        }
    };

    const handlePresetApply = (preset: Preset) => {
        handleApplyLoadout(preset.loadout, preset.name);
    }

    const getParent = () => {
        return presets.find(p => p.uuid == editingPreset?.parentUuid || selectedPreset?.parentUuid)?.loadout
    }

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
                            <WeaponGrid onSkinSelectAction={handleSkinSelect} onBuddySelectAction={handleBuddySelect} currentLoadout={currentLoadout} parent={getParent()} />
                        </div>
                        {(() => {
                            const activePreset = editingPreset || selectedPreset;
                            if (activePreset && activePreset.uuid !== defaultPreset.uuid && !activePreset.parentUuid) {
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
                isVariant={originalPreset?.parentUuid ? true : false}
                isDefaultPreset={originalPreset?.uuid === defaultPreset.uuid}/>}
            <PresetNameModal show={showPresetNameModal} onCloseAction={handleClosePresetNameModal} onSaveAction={handleSavePresetName} initialName={renamingPreset?.name} />
            <ErrorModal show={showErrorModal} onClose={handleCloseErrorModal} message={errorMessage} />
            <Toast show={showToast} onClose={handleCloseToast} message={toastMessage} />
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
