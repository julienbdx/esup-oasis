/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Badge, Col, Tooltip } from "antd";
import { FILTRE_BENEFICIAIRE_DEFAULT, FiltreBeneficiaire } from "./BeneficiaireTable";
import { useBeneficiaireFilterOptions } from "./hooks/useBeneficiaireFilterOptions";
import { FilterFieldNomBeneficiaire } from "./filters/FilterFieldNomBeneficiaire";
import { FilterFieldAccompagnement } from "./filters/FilterFieldAccompagnement";
import { FilterFieldGestionnairesBeneficiaire } from "./filters/FilterFieldGestionnairesBeneficiaire";
import { FilterFieldProfils } from "./filters/FilterFieldProfils";
import { FilterFieldTagsBeneficiaire } from "./filters/FilterFieldTagsBeneficiaire";
import { FilterFieldAvisEseBeneficiaire } from "./filters/FilterFieldAvisEseBeneficiaire";
import { FilterFieldDecisionEtablissement } from "./filters/FilterFieldDecisionEtablissement";
import { FilterFieldComposantesBeneficiaire } from "./filters/FilterFieldComposantesBeneficiaire";
import { FilterFieldFormationsBeneficiaire } from "./filters/FilterFieldFormationsBeneficiaire";
import { FilterPanel } from "./FilterPanel";

export function BeneficiaireTableFilter(props: {
   filtreBeneficiaire: FiltreBeneficiaire;
   setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
}) {
   const {
      profils,
      stats,
      composantes,
      formations,
      tags,
      gestionnaires,
      isFetchingGestionnaires,
      user,
   } = useBeneficiaireFilterOptions(props.filtreBeneficiaire);

   return (
      <FilterPanel
         filtre={props.filtreBeneficiaire}
         setFiltre={props.setFiltreBeneficiaire}
         filtreType="filtresBeneficiaire"
         defaultFilter={FILTRE_BENEFICIAIRE_DEFAULT}
         extraLabel={
            user?.isGestionnaire &&
            stats?.nbBeneficiairesIncomplets &&
            stats.nbBeneficiairesIncomplets > 0 ? (
               <Tooltip title="Bénéficiaires avec profil à renseigner">
                  <Badge className="ml-2" count={stats.nbBeneficiairesIncomplets} />
               </Tooltip>
            ) : null
         }
      >
         <FilterFieldNomBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
         />
         <FilterFieldAccompagnement
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
         />
         <FilterFieldGestionnairesBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
            gestionnaires={gestionnaires}
            isFetchingGestionnaires={isFetchingGestionnaires}
         />
         <FilterFieldProfils
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
            profils={profils}
            nbBeneficiairesIncomplets={stats?.nbBeneficiairesIncomplets}
            user={user}
         />
         <FilterFieldTagsBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
            tags={tags}
         />
         <FilterFieldAvisEseBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
         />
         <FilterFieldDecisionEtablissement
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
         />
         <Col xs={0} />
         <FilterFieldComposantesBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
            composantes={composantes}
         />
         <FilterFieldFormationsBeneficiaire
            filtreBeneficiaire={props.filtreBeneficiaire}
            setFiltreBeneficiaire={props.setFiltreBeneficiaire}
            formations={formations}
         />
      </FilterPanel>
   );
}
