/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useState } from "react";
import { ThemeMode } from "@context/accessibilite/AccessibiliteContext";
import { env } from "@/env";

export const DARKMODE_ENABLED = env.REACT_APP_DARKMODE !== "false";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useEffectiveTheme(themeMode: ThemeMode): "light" | "dark" {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  useEffect(() => {
    if (!DARKMODE_ENABLED) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!DARKMODE_ENABLED) return "light";
  if (themeMode === "system") return systemTheme;
  return themeMode;
}
