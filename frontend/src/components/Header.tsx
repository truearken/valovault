"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { getLatestReleaseVersion } from "@/services/api";
import Image from "next/image";

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const [appVersion, setAppVersion] = useState('');
    const [isOutdated, setIsOutdated] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            const currentVersion = await getVersion();
            setAppVersion(currentVersion);

            const latestVersion = await getLatestReleaseVersion();
            if (latestVersion) {
                // Simple semver comparison
                const currentParts = currentVersion.split('.').map(Number);
                const latestParts = latestVersion.replace('v', '').split('.').map(Number);

                let outdated = false;
                for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
                    const current = currentParts[i] || 0;
                    const latest = latestParts[i] || 0;
                    if (latest > current) {
                        outdated = true;
                        break;
                    }
                    if (current > latest) {
                        break;
                    }
                }
                setIsOutdated(outdated);
            }
        };

        checkVersion();
    }, []);

    return (
        <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
            <div className="container d-flex align-items-center">
                <a href="https://github.com/truearken/valovault" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center me-2">
                    <Image src="/github-logo.svg" alt="GitHub" width={24} height={24} />
                </a>
                <span className="navbar-brand me-2">ValoVault</span>
                {appVersion && (
                    <>
                        <span className="badge bg-secondary me-2">{appVersion}</span>
                        {isOutdated && (
                            <a href="https://github.com/truearken/valovault/releases" target="_blank" rel="noopener noreferrer" title="Update available">
                                <Image src="/update-available.svg" alt="Update available" width={24} height={24} />
                            </a>
                        )}
                    </>
                )}
                <div className="ms-auto">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        onClick={toggleTheme}
                        style={{ width: '2.5rem', height: '2.5rem', padding: 0 }}
                        title="Toggle theme">
                        {isDarkMode ? "L" : "D"}
                    </button>
                </div>
            </div>
        </nav>
    );
}
