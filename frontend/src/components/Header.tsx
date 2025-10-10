"use client";

import { useTheme } from "@/context/ThemeContext";

type HeaderProps = {};

export default function Header({ }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
            <div className="container">
                <span className="navbar-brand">ValoVault</span>
                <div className="ms-auto">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                        onClick={toggleTheme}
                        style={{ width: '2.5rem', height: '2.5rem', padding: 0 }}
                        title="Toggle theme"
                    >
                        {isDarkMode ? "L" : "D"}
                    </button>
                </div>
            </div>
        </nav>
    );
}
