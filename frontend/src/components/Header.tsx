"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check } from '@tauri-apps/plugin-updater';
import Image from "next/image";

type HeaderProps = {
    performUpdateAction: () => void;
};

export default function Header({ performUpdateAction: performUpdateAction }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const [appVersion, setAppVersion] = useState('');
    const [isOutdated, setIsOutdated] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            const currentVersion = await getVersion();
            setAppVersion(currentVersion);

            const update = await check();

            if (update) {
                setIsOutdated(true);
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
                            <button className="btn" onClick={performUpdateAction} title="Click to update">
                                <Image src="/update-available.svg" alt="Click to update" width={24} height={24} />
                            </button>
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
