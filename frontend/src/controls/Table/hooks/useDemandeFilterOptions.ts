/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import {
   PREFETCH_COMPOSANTES,
   PREFETCH_ETAT_DEMANDE,
   PREFETCH_FORMATIONS,
   PREFETCH_TYPES_DEMANDES,
} from "@api/ApiPrefetchHelpers";
import { NB_MAX_ITEMS_PER_PAGE } from "@/constants";
import { FiltreDemande } from "@controls/Table/DemandeTable";

/**
 * Hook custom pour gérer les données et la logique du filtre de demandes
 */
export function useDemandeFilterOptions(_filtreDemande: FiltreDemande) {
   const { user, impersonate } = useAuth();
   const api = useApi();

   // Récupération de la liste des gestionnaires (hors renforts)
   const { data: gestionnaires, isFetching: isFetchingGestionnaires } =
      api.useGetCollectionPaginated({
         path: "/roles/{roleId}/utilisateurs",
         parameters: { roleId: "/roles/ROLE_GESTIONNAIRE" },
         page: 1,
         itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
         query: { "order[nom]": "asc" },
         enabled: !impersonate && user?.isPlanificateur,
      });

   // Récupération des disciplines sportives
   const { data: disciplines } = api.useGetCollectionPaginated({
      path: "/disciplines_sportives",
      page: 1,
      itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      query: { "order[libelle]": "asc", page: 1, itemsPerPage: NB_MAX_ITEMS_PER_PAGE },
   });

   const { data: etats } = api.useGetCollection(PREFETCH_ETAT_DEMANDE);
   const { data: composantes } = api.useGetCollection(PREFETCH_COMPOSANTES);
   const { data: formations } = api.useGetCollection(PREFETCH_FORMATIONS);
   const { data: types } = api.useGetCollection(PREFETCH_TYPES_DEMANDES);

   return {
      gestionnaires,
      isFetchingGestionnaires,
      disciplines,
      etats,
      composantes,
      formations,
      types,
      user,
   };
}
