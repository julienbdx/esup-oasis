/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Collapse, Row } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { FiltresFavoris } from "./FiltresFavoris";
import { FiltreAmenagement, getFiltreAmenagementDefault } from "./AmenagementTableLayout";
import { ModeAffichageAmenagement } from "../../routes/gestionnaire/beneficiaires/Amenagements";
import { FiltreFavoriDropDown } from "./FiltreFavoriDropDown";
import { Utilisateur } from "../../lib/Utilisateur";
import { useAmenagementFilterOptions } from "./hooks/useAmenagementFilterOptions";
import { FilterFieldNom } from "./filters/FilterFieldNom";
import { FilterFieldDomaine } from "./filters/FilterFieldDomaine";
import { FilterFieldCategories } from "./filters/FilterFieldCategories";
import { FilterFieldTypes } from "./filters/FilterFieldTypes";
import { FilterFieldGestionnaires } from "./filters/FilterFieldGestionnaires";
import { FilterFieldTags } from "./filters/FilterFieldTags";
import { FilterFieldAvisEse } from "./filters/FilterFieldAvisEse";
import { FilterFieldSuivis } from "./filters/FilterFieldSuivis";
import { FilterFieldComposantes } from "./filters/FilterFieldComposantes";
import { FilterFieldFormations } from "./filters/FilterFieldFormations";

export function AmenagementTableFilter(props: {
   filtreAmenagement: FiltreAmenagement;
   setFiltreAmenagement: React.Dispatch<React.SetStateAction<FiltreAmenagement>>;
   modeAffichage: ModeAffichageAmenagement;
}) {
   const {
      categoriesAmenagements,
      typesAmenagements,
      suivis,
      composantes,
      formations,
      tags,
      gestionnaires,
      isFetchingGestionnaires,
      estRenfort,
      estReferent,
      user,
   } = useAmenagementFilterOptions(props.filtreAmenagement);

   return (
      <Collapse
         accordion
         className="mb-3"
         items={[
            {
               key: "filter_save",
               label: (
                  <>
                     <FiltreFavoriDropDown
                        className="float-right mt-05"
                        setFiltre={props.setFiltreAmenagement}
                        filtreType={
                           props.modeAffichage === ModeAffichageAmenagement.ParAmenagement
                              ? "filtresAmenagement"
                              : "filtresAmenagementParBeneficiaire"
                        }
                     />
                     Filtres sauvegardés
                  </>
               ),
               children: (
                  <FiltresFavoris
                     filtre={props.filtreAmenagement}
                     setFiltre={props.setFiltreAmenagement}
                     filtreType={
                        props.modeAffichage === ModeAffichageAmenagement.ParAmenagement
                           ? "filtresAmenagement"
                           : "filtresAmenagementParBeneficiaire"
                     }
                     defaultFilter={getFiltreAmenagementDefault(user as Utilisateur)}
                  />
               ),
            },
            {
               key: "filters",
               label: (
                  <>
                     <FilterOutlined className="float-right" style={{ marginTop: 4 }} aria-hidden />
                     Filtres complémentaires
                  </>
               ),
               children: (
                  <Row gutter={[16, 16]}>
                     <FilterFieldNom
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                     />

                     <FilterFieldDomaine
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        modeAffichage={props.modeAffichage}
                        estRenfort={estRenfort}
                        estReferent={estReferent}
                     />

                     <FilterFieldCategories
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        categoriesAmenagements={categoriesAmenagements}
                        typesAmenagements={typesAmenagements}
                        user={user}
                        estRenfort={estRenfort}
                        estReferent={estReferent}
                     />

                     <FilterFieldTypes
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        typesAmenagements={typesAmenagements}
                        estRenfort={estRenfort}
                        estReferent={estReferent}
                     />

                     <FilterFieldGestionnaires
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        gestionnaires={gestionnaires}
                        isFetchingGestionnaires={isFetchingGestionnaires}
                        user={user}
                     />

                     <FilterFieldTags
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        tags={tags}
                        estRenfort={estRenfort}
                        estReferent={estReferent}
                     />

                     <FilterFieldAvisEse
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        modeAffichage={props.modeAffichage}
                        estRenfort={estRenfort}
                        estReferent={estReferent}
                     />

                     <FilterFieldSuivis
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        suivis={suivis}
                        modeAffichage={props.modeAffichage}
                     />

                     <FilterFieldComposantes
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        composantes={composantes}
                     />

                     <FilterFieldFormations
                        filtreAmenagement={props.filtreAmenagement}
                        setFiltreAmenagement={props.setFiltreAmenagement}
                        formations={formations}
                     />
                  </Row>
               ),
            },
         ]}
      />
   );
}
