/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { FiltreDemande } from "./DemandeTable";
import { RefsTourDemandes } from "../../routes/gestionnaire/demandeurs/Demandeurs";
import { UseStateDispatch } from "../../utils/utils";
import { useDemandeFilterOptions } from "./hooks/useDemandeFilterOptions";
import { FilterFieldNomDemandeur } from "./filters/FilterFieldNomDemandeur";
import { FilterFieldTypesDemandes } from "./filters/FilterFieldTypesDemandes";
import { FilterFieldEtatDemande } from "./filters/FilterFieldEtatDemande";
import { FilterFieldGestionnairesDemande } from "./filters/FilterFieldGestionnairesDemande";
import { FilterFieldDisciplinesSportives } from "./filters/FilterFieldDisciplinesSportives";
import { FilterFieldComposantesDemande } from "./filters/FilterFieldComposantesDemande";
import { FilterFieldFormationsDemande } from "./filters/FilterFieldFormationsDemande";
import { FilterFieldArchivees } from "./filters/FilterFieldArchivees";
import { FilterPanel } from "./FilterPanel";

export function DemandeTableFilters(props: {
   filtreDemande: FiltreDemande;
   setFiltreDemande: UseStateDispatch<FiltreDemande>;
   defaultFilter: FiltreDemande;
   refs: RefsTourDemandes;
   affichageTour?: boolean;
}) {
   const {
      gestionnaires,
      isFetchingGestionnaires,
      disciplines,
      etats,
      composantes,
      formations,
      types,
   } = useDemandeFilterOptions(props.filtreDemande);

   return (
      <FilterPanel
         filtre={props.filtreDemande}
         setFiltre={props.setFiltreDemande}
         filtreType="filtresDemande"
         defaultFilter={props.defaultFilter}
         refDetails={props.refs.filtresDetails}
         refFavoris={props.refs.favoris as React.RefObject<HTMLDivElement>}
         refFiltres={props.refs.filtres as React.RefObject<HTMLDivElement>}
         activeKey={props.affichageTour ? ["filters", "filter_save"] : undefined}
         accordion={!props.affichageTour}
      >
         <FilterFieldNomDemandeur
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
         />
         <FilterFieldTypesDemandes
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            types={types}
         />
         <FilterFieldEtatDemande
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            etats={etats}
         />
         <FilterFieldGestionnairesDemande
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            gestionnaires={gestionnaires}
            isFetchingGestionnaires={isFetchingGestionnaires}
         />
         <FilterFieldDisciplinesSportives
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            disciplines={disciplines}
         />
         <FilterFieldComposantesDemande
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            composantes={composantes}
         />
         <FilterFieldFormationsDemande
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
            formations={formations}
         />
         <FilterFieldArchivees
            filtreDemande={props.filtreDemande}
            setFiltreDemande={props.setFiltreDemande}
         />
      </FilterPanel>
   );
}
