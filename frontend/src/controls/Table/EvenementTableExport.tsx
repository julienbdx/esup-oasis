/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { NB_MAX_ITEMS_PER_PAGE } from "@/constants";
import { Evenement } from "@lib/Evenement";
import dayjs from "dayjs";
import { PREFETCH_CAMPUS, PREFETCH_TYPES_EVENEMENTS } from "@api/ApiPrefetchHelpers";
import { ICampus, ITypeEvenement, IUtilisateur } from "@api/ApiTypeHelpers";
import ExportButton from "@controls/Buttons/ExportButton";

const headers = [
  { label: "Début", key: "debut" },
  { label: "Fin", key: "fin" },
  { label: "Catégorie d'évènement", key: "categorie" },
  { label: "Bénéficiaires", key: "beneficiaires" },
  { label: "Intervenant / Renfort", key: "intervenant" },
  { label: "Campus", key: "campus" },
  { label: "Transmis à la RH", key: "transmisRh" },
];

function getEvenementsData(
  evenements: Evenement[],
  typesEvenements: ITypeEvenement[] | undefined,
  beneficiaires: IUtilisateur[] | undefined,
  intervenants: IUtilisateur[] | undefined,
  campus: ICampus[] | undefined,
) {
  return evenements.map((evenement) => {
    const intervenant = intervenants?.find((i) => i["@id"] === evenement.intervenant);
    return {
      key: evenement["@id"],
      "@id": evenement["@id"],
      debut: evenement.debut ? dayjs(evenement.debut).format("DD/MM/YYYY HH:mm") : "",
      fin: evenement.debut ? dayjs(evenement.fin).format("DD/MM/YYYY HH:mm") : "",
      categorie: evenement.type
        ? typesEvenements?.find((t) => t["@id"] === evenement.type)?.libelle?.replaceAll('"', '""')
        : "",
      beneficiaires: evenement.beneficiaires
        ?.map((beneficiaire) => beneficiaires?.find((b) => b["@id"] === beneficiaire))
        .map((beneficiaire) => `${beneficiaire?.nom?.toLocaleUpperCase()} ${beneficiaire?.prenom}`)
        .join(", "),
      intervenant: intervenant
        ? `${intervenant?.nom?.toLocaleUpperCase()} ${intervenant?.prenom}`
        : "",
      campus: campus?.find((c) => c["@id"] === evenement.campus)?.libelle?.replaceAll('"', '""'),
      transmisRh: evenement.isTransmisRH() ? "Oui" : "Non",
    };
  });
}

interface TableEvenementsExportProps {
  evenements: Evenement[];
}

export default function EvenementTableExport({ evenements }: TableEvenementsExportProps) {
  const [exportKey, setExportKey] = useState(0);
  const [exportSubmit, setExportSubmit] = useState(false);

  const { data: beneficiaires } = useApi().useGetCollectionPaginated({
    path: "/beneficiaires",
    itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
    page: 1,
    enabled: exportSubmit,
  });
  const { data: intervenants } = useApi().useGetCollectionPaginated({
    path: "/intervenants",
    itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
    page: 1,
    enabled: exportSubmit,
  });
  const { data: campus } = useApi().useGetCollection({
    ...PREFETCH_CAMPUS,
    enabled: exportSubmit,
  });
  const { data: typesEvenements } = useApi().useGetCollection({
    ...PREFETCH_TYPES_EVENEMENTS,
    enabled: exportSubmit,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExportKey((k) => k + 1);
    setExportSubmit(false);
  }, [evenements]);

  const refDataReady = !!(
    beneficiaires?.items &&
    intervenants?.items &&
    campus?.items &&
    typesEvenements?.items
  );

  return (
    <ExportButton
      key={exportKey}
      getData={() =>
        getEvenementsData(
          evenements,
          typesEvenements?.items,
          beneficiaires?.items,
          intervenants?.items,
          campus?.items,
        )
      }
      headers={headers}
      filename="evenements"
      ready={refDataReady}
      onStart={() => setExportSubmit(true)}
    />
  );
}
