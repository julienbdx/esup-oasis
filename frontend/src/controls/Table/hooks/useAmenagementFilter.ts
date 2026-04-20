/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";
import {
  FiltreAmenagement,
  getFiltreAmenagementDefault,
} from "@controls/Table/AmenagementTableLayout";
import { Utilisateur } from "@lib/Utilisateur";
import { ModeAffichageAmenagement } from "@routes/gestionnaire/beneficiaires/Amenagements";

/**
 * Hook custom pour gérer l'état du filtre d'aménagements
 * Gère le chargement initial via les préférences et la synchronisation lors du changement de mode
 */
export function useAmenagementFilter(modeAffichage: ModeAffichageAmenagement) {
  const auth = useAuth();
  const { getPreferenceArray, preferencesChargees } = usePreferences();

  const [filtreAmenagement, setFiltreAmenagement] = useState<FiltreAmenagement>({
    ...getFiltreAmenagementDefault(auth.user as Utilisateur),
    // on applique le filtre favori des préférences de l'utilisateur s'il existe
    ...{
      ...getPreferenceArray(
        modeAffichage === ModeAffichageAmenagement.ParAmenagement
          ? "filtresAmenagement"
          : "filtresAmenagementParBeneficiaire",
      )?.filter((f) => f.favori)[0]?.filtre,
      page: 1,
    },
  });

  // Synchronisation lors du changement de mode d'affichage ou d'utilisateur
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltreAmenagement({
      ...getFiltreAmenagementDefault(auth.user as Utilisateur),
      // on applique le filtre favori des préférences de l'utilisateur s'il existe
      ...{
        ...getPreferenceArray(
          modeAffichage === ModeAffichageAmenagement.ParAmenagement
            ? "filtresAmenagement"
            : "filtresAmenagementParBeneficiaire",
        )?.filter((f) => f.favori)[0]?.filtre,
        page: 1,
      },
    });
  }, [modeAffichage, auth.user, getPreferenceArray]);

  // Synchronisation une fois les préférences chargées
  useEffect(() => {
    if (preferencesChargees) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltreAmenagement({
        ...getFiltreAmenagementDefault(auth.user as Utilisateur),
        // on applique le filtre favori des préférences de l'utilisateur s'il existe
        ...getPreferenceArray(
          modeAffichage === ModeAffichageAmenagement.ParAmenagement
            ? "filtresAmenagement"
            : "filtresAmenagementParBeneficiaire",
        )?.filter((f) => f.favori)[0]?.filtre,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesChargees]);

  return [filtreAmenagement, setFiltreAmenagement] as const;
}
