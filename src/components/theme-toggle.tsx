"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div className="theme-control">
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((theme) => theme === "light" ? "dark" : "light")}
      >
        <span className="theme-light-target">
          <Sun size={19} strokeWidth={1.6} aria-hidden="true" />
          <span className="sr-only">Switch to light mode</span>
        </span>
        <span className="theme-dark-target">
          <Moon size={19} strokeWidth={1.6} aria-hidden="true" />
          <span className="sr-only">Switch to dark mode</span>
        </span>
      </button>
      <span className="theme-tooltip" aria-hidden="true">
        <span className="theme-light-target">Light mode</span>
        <span className="theme-dark-target">Dark mode</span>
      </span>
    </div>
  );
}