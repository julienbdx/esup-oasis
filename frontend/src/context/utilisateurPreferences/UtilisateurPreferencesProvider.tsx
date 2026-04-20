/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "@/constants";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { queryClient } from "@/queryClient";
import { QK_UTILISATEURS_PARAMETRES_UI } from "@api/queryKeys";

export interface UtilisateurPreferencesType {
  getPreference: (cle: string) => string | undefined;
  getPreferenceJson: (cle: string) => object | undefined;
  getPreferenceArray: (cle: string) => any[];
  setPreference: (cle: string, value: string) => void;
  setPreferenceJson: (cle: string, value: object) => void;
  setPreferenceArray: (cle: string, value: any[]) => void;
  preferencesChargees: boolean;
}

const UtilisateurPreferencesContext = createContext<UtilisateurPreferencesType>({
  getPreference: () => "",
  getPreferenceJson: () => ({}),
  getPreferenceArray: () => [],
  setPreference: () => {},
  setPreferenceJson: () => {},
  setPreferenceArray: () => {},
  preferencesChargees: false,
});

export function UtilisateurPreferencesProvider(props: { children: ReactNode }) {
  const auth = useAuth();
  const { setContrast, setDyslexieArial, setDyslexieOpenDys, setPoliceLarge } = useAccessibilite();
  const [preferencesChargees, setPreferencesChargees] = React.useState<boolean>(false);
  const { data: preferences } = useApi().useGetCollectionPaginated({
    path: "/utilisateurs/{uid}/parametres_ui",
    parameters: { uid: auth.user?.["@id"] as string },
    page: 1,
    itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
    enabled: !!auth.user,
    onError: (error) => {
      console.error(error);
    },
  });

  const mutatePreference = useApi().usePut({
    path: "/utilisateurs/{uid}/parametres_ui/{cle}",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK_UTILISATEURS_PARAMETRES_UI] }).then();
    },
  });
  const { mutate: mutatePreferenceRaw } = mutatePreference;

  useEffect(() => {
    if (preferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferencesChargees(true);
    }
  }, [preferences]);

  // Accessibilité
  useEffect(() => {
    if (preferences) {
      // Rétablissement des préférences d'accessibilité
      const contrast = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/contrast`,
      );
      if (contrast) setContrast(contrast?.valeur === "true");

      const dyslexieArial = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/dyslexie-arial`,
      );
      if (dyslexieArial) setDyslexieArial(dyslexieArial?.valeur === "true");

      const dyslexieOpenDys = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/dyslexie-opendys`,
      );
      if (dyslexieOpenDys) setDyslexieOpenDys(dyslexieOpenDys?.valeur === "true");

      const policeLarge = preferences.items.find(
        (p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/police-large`,
      );
      if (policeLarge) setPoliceLarge(policeLarge?.valeur === "true");
    }
  }, [auth.user, preferences, setContrast, setDyslexieArial, setDyslexieOpenDys, setPoliceLarge]);

  const getPreference = useCallback(
    (cle: string) =>
      preferences?.items.find((p) => p["@id"] === `${auth.user?.["@id"]}/parametres_ui/${cle}`)
        ?.valeur,

    [preferences, auth.user],
  );

  const getPreferenceJson = useCallback(
    (cle: string): object => JSON.parse(getPreference(cle) || "{}"),
    [getPreference],
  );

  const getPreferenceArray = useCallback(
    (cle: string): any[] => JSON.parse(getPreference(cle) || "[]"),
    [getPreference],
  );

  const setPreference = useCallback(
    (cle: string, value: string) => {
      mutatePreferenceRaw({
        "@id": `${auth.user?.["@id"]}/parametres_ui/${cle}`,
        data: {
          valeur: value,
        },
      });
    },
    // mutatePreferenceRaw est stable (garanti par React Query)
    [mutatePreferenceRaw, auth.user],
  );

  const setPreferenceJson = useCallback(
    (cle: string, value: object) => {
      setPreference(cle, JSON.stringify(value));
    },
    [setPreference],
  );

  const setPreferenceArray = useCallback(
    (cle: string, value: any[]) => {
      setPreference(cle, JSON.stringify(value));
    },
    [setPreference],
  );

  const contextValue = useMemo(
    () => ({
      getPreference,
      getPreferenceJson,
      getPreferenceArray,
      setPreference,
      setPreferenceJson,
      setPreferenceArray,
      preferencesChargees,
    }),
    [
      getPreference,
      getPreferenceJson,
      getPreferenceArray,
      setPreference,
      setPreferenceJson,
      setPreferenceArray,
      preferencesChargees,
    ],
  );

  return (
    <UtilisateurPreferencesContext.Provider value={contextValue}>
      {props.children}
    </UtilisateurPreferencesContext.Provider>
  );
}

export function usePreferences(): UtilisateurPreferencesType {
  return useContext(UtilisateurPreferencesContext);
}
