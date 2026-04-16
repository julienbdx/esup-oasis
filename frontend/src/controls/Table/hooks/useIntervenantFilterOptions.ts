/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import {
  PREFETCH_CAMPUS,
  PREFETCH_COMPETENCES,
  PREFETCH_TYPES_EVENEMENTS,
} from "@api/ApiPrefetchHelpers";
import { FiltreIntervenant } from "@controls/Table/IntervenantTable";

/**
 * Hook custom pour gérer les données et la logique du filtre d'intervenants
 */
export function useIntervenantFilterOptions(_filtreIntervenant: FiltreIntervenant) {
  const api = useApi();

  const { data: campuses } = api.useGetCollection(PREFETCH_CAMPUS);
  const { data: competences } = api.useGetCollection(PREFETCH_COMPETENCES);
  const { data: categories } = api.useGetCollection(PREFETCH_TYPES_EVENEMENTS);

  return {
    campuses,
    competences,
    categories,
  };
}
