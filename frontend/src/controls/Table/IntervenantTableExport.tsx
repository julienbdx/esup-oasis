/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ICampus, ICompetence, IIntervenant } from "@api/ApiTypeHelpers";
import { useEffect, useState } from "react";
import { useApi } from "@context/api/ApiProvider";
import { FiltreIntervenant } from "@controls/Table/IntervenantTable";
import { PREFETCH_CAMPUS, PREFETCH_COMPETENCES } from "@api/ApiPrefetchHelpers";
import CsvExportButton from "@controls/Table/Export/CsvExportButton";

const headers: { label: string; key: string }[] = [
  { label: "Nom", key: "nom" },
  { label: "Prénom", key: "prenom" },
  { label: "Email", key: "email" },
  { label: "Numéro étudiant", key: "numeroEtudiant" },
  { label: "Compétences", key: "competences" },
  { label: "Campus", key: "campus" },
];

function getIntervenantsData(
  intervenants: IIntervenant[],
  competences: ICompetence[] | undefined,
  campus: ICampus[] | undefined,
) {
  return intervenants.map((intervenant) => {
    return {
      key: intervenant["@id"],
      "@id": intervenant["@id"],
      nom: intervenant.nom?.toLocaleUpperCase(),
      prenom: intervenant.prenom,
      email: intervenant.email,
      numeroEtudiant: intervenant.numeroEtudiant,
      competences: intervenant.competences
        ?.map((competence) => {
          if (!competence) return null;
          return competences?.find((c) => c["@id"] === competence);
        })
        .map((competence) => competence?.libelle?.replaceAll('"', '""'))
        .join(", "),
      campus: intervenant.campus
        ?.map((c) => {
          if (!c) return null;
          return campus?.find((ca) => ca["@id"] === c);
        })
        ?.map((c) => `${c?.libelle?.replaceAll('"', '""')}`)
        .join(", "),
    };
  });
}

interface TableIntervenantsExportProps {
  filtreIntervenant: FiltreIntervenant;
}

export default function IntervenantTableExport({
  filtreIntervenant,
}: TableIntervenantsExportProps) {
  const [exportKey, setExportKey] = useState(0);
  const [exportSubmit, setExportSubmit] = useState(false);

  const { data: competences } = useApi().useGetFullCollection({
    ...PREFETCH_COMPETENCES,
    enabled: exportSubmit,
  });
  const { data: campus } = useApi().useGetFullCollection({
    ...PREFETCH_CAMPUS,
    enabled: exportSubmit,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExportKey((k) => k + 1);
    setExportSubmit(false);
  }, [filtreIntervenant]);

  const refDataReady = !!(competences?.items && campus?.items);

  return (
    <CsvExportButton<"/intervenants">
      key={exportKey}
      path="/intervenants"
      itemsPerPage={200}
      query={{
        ...filtreIntervenant,
        intervenantArchive:
          filtreIntervenant.intervenantArchive === "undefined"
            ? undefined
            : filtreIntervenant.intervenantArchive,
      }}
      headers={headers}
      filename="intervenants"
      getData={(items) => getIntervenantsData(items, competences?.items, campus?.items)}
      ready={refDataReady}
      onStart={() => setExportSubmit(true)}
    />
  );
}
