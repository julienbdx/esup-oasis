/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { OAUTH_STATE_KEY } from "@/auth/hook/constants";
import { AuthTokenPayload } from "@/auth/hook/useOAuth2";

// --- Gestion du state : permet de vérifier que la réponse de l'authentification provient bien de l'authentification

export type State<TData = AuthTokenPayload> = TData | null;

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
const STATE_LENGTH = 40;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const getStateCharacter = (value: number): string => ALPHABET[value % ALPHABET.length];

export const generateState = () => {
   const randomValues = new Uint8Array(STATE_LENGTH);
   window.crypto.getRandomValues(randomValues);

   const stateCharacters = Array.from(randomValues, getStateCharacter);
   return stateCharacters.join("");
};
export const saveState = (state: string) => {
   sessionStorage.setItem(OAUTH_STATE_KEY, state);
};
export const removeState = () => {
   sessionStorage.removeItem(OAUTH_STATE_KEY);
};
