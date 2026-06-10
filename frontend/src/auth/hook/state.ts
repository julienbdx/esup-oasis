/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { OAUTH_NONCE_KEY, OAUTH_STATE_KEY } from "@/auth/hook/constants";

// Encodage hexadécimal : chaque octet produit exactement 2 caractères, sans biais
// de distribution (contrairement à un mapping modulo sur un alphabet de 62 caractères).
const TOKEN_BYTES = 20; // 40 caractères hexadécimaux

const generateToken = (): string => {
  const randomValues = new Uint8Array(TOKEN_BYTES);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

// --- State (protection CSRF)
export const generateState = (): string => generateToken();
export const saveState = (state: string): void => sessionStorage.setItem(OAUTH_STATE_KEY, state);
export const removeState = (): void => sessionStorage.removeItem(OAUTH_STATE_KEY);

// --- Nonce (protection replay — vérifié par le serveur si OIDC, envoyé systématiquement)
export const generateNonce = (): string => generateToken();
export const saveNonce = (nonce: string): void => sessionStorage.setItem(OAUTH_NONCE_KEY, nonce);
export const getNonce = (): string | null => sessionStorage.getItem(OAUTH_NONCE_KEY);
export const removeNonce = (): void => sessionStorage.removeItem(OAUTH_NONCE_KEY);
