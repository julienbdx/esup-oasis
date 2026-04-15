/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactNode } from "react";
import { Collapse, Row } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { FiltreFavoriDropDown } from "./FiltreFavoriDropDown";
import { FiltresFavoris } from "./FiltresFavoris";
import { UseStateDispatch } from "../../utils/utils";
import { FiltreDecrivable } from "./FiltreDescription";

interface FilterPanelProps<T extends FiltreDecrivable> {
   filtre: T;
   setFiltre: UseStateDispatch<T>;
   filtreType: string;
   defaultFilter: T;
   children: ReactNode;
   extraLabel?: ReactNode;
   accordion?: boolean;
   activeKey?: string[];
   refDetails?: React.RefObject<HTMLDivElement>;
   refFavoris?: React.RefObject<HTMLDivElement>;
   refFiltres?: React.RefObject<HTMLDivElement>;
}

/**
 * Composant générique pour afficher un panneau de filtres avec favoris et filtres complémentaires.
 */
export function FilterPanel<T extends FiltreDecrivable>({
   filtre,
   setFiltre,
   filtreType,
   defaultFilter,
   children,
   extraLabel,
   accordion = true,
   activeKey,
   refDetails,
   refFavoris,
   refFiltres,
}: FilterPanelProps<T>) {
   return (
      <Collapse
         ref={refDetails}
         accordion={accordion}
         activeKey={activeKey}
         className="mb-3"
         items={[
            {
               key: "filter_save",
               ref: refFavoris,
               label: (
                  <>
                     <FiltreFavoriDropDown<T>
                        className="float-right mt-05"
                        setFiltre={setFiltre}
                        filtreType={filtreType}
                     />
                     Filtres sauvegardés
                  </>
               ),
               children: (
                  <FiltresFavoris
                     filtre={filtre}
                     setFiltre={setFiltre}
                     filtreType={filtreType}
                     defaultFilter={defaultFilter}
                  />
               ),
            },
            {
               key: "filters",
               ref: refFiltres,
               label: (
                  <>
                     <FilterOutlined className="float-right" style={{ marginTop: 4 }} aria-hidden />
                     Filtres complémentaires
                     {extraLabel}
                  </>
               ),
               children: <Row gutter={[16, 16]}>{children}</Row>,
            },
         ]}
      />
   );
}
