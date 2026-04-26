"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const themes = [
  { label: "Midnight Workshop", value: "theme-midnight" },
  { label: "Saddle Tan", value: "theme-saddle" },
  { label: "Forge Ember", value: "theme-forge" },
  { label: "Naval Supremacy", value: "theme-naval" },
];

function applyTheme(theme: string) {
  document.documentElement.classList.remove(
    "theme-midnight",
    "theme-saddle",
    "theme-forge",
    "theme-naval",
  );

  document.documentElement.classList.add(theme);
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("theme-midnight");

  useEffect(() => {
    async function loadTheme() {
      const localTheme = localStorage.getItem("wl-theme") ?? "theme-midnight";

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setTheme(localTheme);
        applyTheme(localTheme);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", userData.user.id)
        .single();

      const savedTheme = profile?.theme_preference ?? localTheme;

      setTheme(savedTheme);
      applyTheme(savedTheme);
      localStorage.setItem("wl-theme", savedTheme);
    }

    loadTheme();
  }, []);

  async function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("wl-theme", nextTheme);

    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: nextTheme })
        .eq("id", userData.user.id);
    }
  }

  return (
    <select
      value={theme}
      onChange={(e) => handleThemeChange(e.target.value)}
      className="rounded-lg border border-stone-700 bg-stone-950 px-2 py-1 text-xs font-semibold text-amber-500 outline-none transition hover:border-amber-600"
    >
      {themes.map((themeOption) => (
        <option key={themeOption.value} value={themeOption.value}>
          {themeOption.label}
        </option>
      ))}
    </select>
  );
}
