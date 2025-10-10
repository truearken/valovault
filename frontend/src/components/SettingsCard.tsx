"use client";

import { useTheme } from "@/context/ThemeContext";

type SettingsCardProps = {
    autoSelectAgent?: boolean;
    onAutoSelectAgentChange: (value: boolean) => void;
    isLoading: boolean;
};

export default function SettingsCard({ autoSelectAgent, onAutoSelectAgentChange, isLoading }: SettingsCardProps) {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div className="p-3 border mb-3">
            <h2 className="mb-3">Settings</h2>
            <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="autoSelectAgentSwitch" checked={autoSelectAgent || false} onChange={(e) => onAutoSelectAgentChange(e.target.checked)} disabled={isLoading} />
                <label className="form-check-label" htmlFor="autoSelectAgentSwitch">Auto-select agent-specific loadout</label>
            </div>
            <div className="form-check form-switch mb-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="darkModeSwitch"
                    checked={isDarkMode}
                    onChange={toggleTheme}
                />
                <label className="form-check-label" htmlFor="darkModeSwitch">Dark Mode</label>
            </div>
        </div>
    );
}
