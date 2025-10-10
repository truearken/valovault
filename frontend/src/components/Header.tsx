"use client";

import { useTheme } from "@/context/ThemeContext";

type HeaderProps = {};

export default function Header({}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
      <div className="container">
        <span className="navbar-brand">ValoVault</span>
        <div className="ms-auto">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="darkModeSwitchHeader"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <label className="form-check-label" htmlFor="darkModeSwitchHeader">Dark Mode</label>
          </div>
        </div>
      </div>
    </nav>
  );
}
