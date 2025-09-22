"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WeaponGrid from '@/features/gun-skins/WeaponList';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import { Preset, Agent } from '@/lib/types';
import { getAgents } from '@/services/api';

const defaultPreset: Preset = {
  uuid: 'default-preset',
  name: 'Default',
  loadout: {},
};

export default function Home() {
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [currentLoadout, setCurrentLoadout] = useState<Record<string, string>>(defaultPreset.loadout);
  const [presets, setPresets] = useState<Preset[]>([defaultPreset]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(defaultPreset);
  const [agentPresetMap, setAgentPresetMap] = useState<Record<string, string[]>>({}); // {[presetId]: agentId[]}

  useEffect(() => {
    async function loadAgents() {
      const fetchedAgents = await getAgents();
      setAgents(fetchedAgents);
    }
    loadAgents();
  }, []);

  const handleSkinSelect = (weaponId: string, skinId: string) => {
    setCurrentLoadout(prev => ({ ...prev, [weaponId]: skinId }));
    setSelectedPreset(null); // Deselect preset when loadout changes
  };

  const handleNewPresetClick = () => {
    setIsCreatingPreset(true);
  };

  const handleSavePresetClick = (name: string) => {
    if (!name) return;
    const newPreset: Preset = {
      uuid: crypto.randomUUID(),
      name,
      loadout: currentLoadout,
    };
    setPresets(prev => [...prev, newPreset]);
    setIsCreatingPreset(false);
  };

  const handleCancelClick = () => {
    setIsCreatingPreset(false);
  };

  const handlePresetSelect = (preset: Preset) => {
    setCurrentLoadout(preset.loadout);
    setSelectedPreset(preset);
  };

  const handleAgentAssignment = (agentId: string, isAssigned: boolean) => {
    if (!selectedPreset) return;

    setAgentPresetMap(prev => {
      const currentAssigned = prev[selectedPreset.uuid] || [];
      if (isAssigned) {
        return { ...prev, [selectedPreset.uuid]: [...currentAssigned, agentId] };
      } else {
        return { ...prev, [selectedPreset.uuid]: currentAssigned.filter(id => id !== agentId) };
      }
    });
  };

  return (
    <>
      <Header
        isCreatingPreset={isCreatingPreset}
        onNewPreset={handleNewPresetClick}
        onSavePreset={handleSavePresetClick}
        onCancel={handleCancelClick}
      />
      <main className="container mt-4">
        <div className="row">
          <div className="col-md-8">
            <div className="p-3 border bg-light">
              <h2>Weapon Skins</h2>
              <p>Select a weapon to see available skins.</p>
              <WeaponGrid onSkinSelect={handleSkinSelect} currentLoadout={currentLoadout} />
            </div>
            {selectedPreset && (
              <AgentAssigner 
                agents={agents} 
                selectedPreset={selectedPreset} 
                assignedAgents={agentPresetMap[selectedPreset.uuid] || []}
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
    </>
  );
}