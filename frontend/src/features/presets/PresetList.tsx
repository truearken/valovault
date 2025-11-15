import Image from 'next/image';
import { Preset, Agent } from '@/lib/types';
import Dropdown from 'react-bootstrap/Dropdown';
import React from 'react';

type PresetListProps = {
    presets: Preset[];
    selectedPreset: Preset | null;
    onPresetSelect: (preset: Preset) => void;
    onPresetDelete: (presetId: string) => void;
    onPresetApply: (preset: Preset) => void;
    onPresetRename: (preset: Preset) => void;
    onCreateVariant: (preset: Preset) => void;
    defaultPreset: Preset;
    agents: Agent[];
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, onPresetDelete, onPresetApply, onPresetRename, onCreateVariant, defaultPreset, agents }: PresetListProps) {
    const savedPresets = Array.isArray(presets) ? presets.filter(p => p.uuid !== 'default-preset') : [];

    const getAgentIcons = (agentIds: string[] | undefined) => {
        if (!agentIds) return null;

        if (agentIds.length > 3) {
            const firstTwoAgents = agentIds.slice(0, 2);
            const icons = firstTwoAgents.map(agentId => {
                const agent = agents.find(a => a.uuid === agentId);
                return agent ? <Image key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width={22} height={22} className="me-1 rounded-circle" unoptimized /> : null;
            });
            icons.push(<span key="plus" className="me-1 rounded-circle border d-inline-flex align-items-center justify-content-center" style={{ width: 30, height: 22 }}>+{agentIds.length - 2}</span>);
            return icons;
        }

        return agentIds.map(agentId => {
            const agent = agents.find(a => a.uuid === agentId);
            return agent ? <Image key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width={22} height={22} className="me-1 rounded-circle" unoptimized /> : null;
        });
    };

    const topLevelPresets = savedPresets.filter(p => !p.parentUuid);
    const childrenByParent = savedPresets.reduce((acc, preset) => {
        if (preset.parentUuid) {
            (acc[preset.parentUuid] = acc[preset.parentUuid] || []).push(preset);
        }
        return acc;
    }, {} as Record<string, Preset[]>);

    return (
        <div>
            <div className="list-group">
                <button
                    type="button"
                    className={`list-group-item list-group-item-action ${selectedPreset?.uuid === defaultPreset.uuid ? 'active' : ''}`}
                    onClick={() => onPresetSelect(defaultPreset)}>
                    {defaultPreset.name}
                </button>
            </div>
            <hr />
            <h5>Saved Presets</h5>
            {savedPresets.length === 0 ? (
                <p>No presets saved yet.</p>
            ) : (
                <div className="list-group">
                    {topLevelPresets.map((preset) => (
                        <React.Fragment key={preset.uuid}>
                            <div className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}>
                                <div className="flex-grow-1 overflow-hidden" onClick={() => onPresetSelect(preset)} style={{ cursor: 'pointer' }}>
                                    <div className="text-truncate">{preset.name}</div>
                                    {getAgentIcons(preset.agents)}
                                </div>
                                <div className="d-flex flex-shrink-0 gap-1">
                                    <button className="btn btn-success btn-sm" onClick={() => onPresetApply(preset)}>Apply</button>
                                    <Dropdown>
                                        <Dropdown.Toggle />
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#" onClick={() => onPresetRename(preset)}>Rename</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => onPresetDelete(preset.uuid)}>Delete</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => onCreateVariant(preset)}>Create Variant</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            {childrenByParent[preset.uuid]?.map(child => (
                                <div key={child.uuid} className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === child.uuid ? 'active' : ''}`}>
                                    <div className="d-flex align-items-center flex-grow-1 overflow-hidden" onClick={() => onPresetSelect(child)} style={{ cursor: 'pointer' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor" style={{ flexShrink: 0 }}>
                                            <path d="M0 0h24v24H0V0z" fill="none"/>
                                            <path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>
                                        </svg>
                                        <div className="ms-2 flex-grow-1 overflow-hidden">
                                            <div className="text-truncate">{child.name}</div>
                                            {getAgentIcons(child.agents)}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-shrink-0 gap-1">
                                        <button className="btn btn-success btn-sm" onClick={() => onPresetApply(child)}>Apply</button>
                                        <Dropdown>
                                            <Dropdown.Toggle />
                                            <Dropdown.Menu>
                                                <Dropdown.Item href="#" onClick={() => onPresetRename(child)}>Rename</Dropdown.Item>
                                                <Dropdown.Item href="#" onClick={() => onPresetDelete(child.uuid)}>Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
