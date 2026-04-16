/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Flex, Popconfirm } from "antd";
import { initialAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import React from "react";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_TYPES_EVENEMENTS } from "@api/ApiPrefetchHelpers";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";

export function FiltresFavorisEvenements() {
  const { message } = App.useApp();
  const { getPreferenceArray, setPreferenceArray } = usePreferences();
  const { data: typesEvenements } = useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);
  const {
    affichageFiltres: appAffichageFiltres,
    restoreFiltres,
    setFiltres,
  } = useAffichageFiltres();

  return (
    <li className="filter mb-1 mt-2">
      <h2 className="sr-only">Filtres</h2>
      <Dropdown
        menu={{
          items: [
            ...getPreferenceArray("filtresEvenement").map((filtre) => ({
              key: filtre.nom,
              label: (
                <Flex justify="space-between">
                  <span>{filtre.nom}</span>
                  <Popconfirm
                    title="Supprimer le filtre ?"
                    onConfirm={(event) => {
                      event?.stopPropagation();
                      setPreferenceArray(
                        "filtresEvenement",
                        getPreferenceArray("filtresEvenement").filter((f) => f.nom !== filtre.nom),
                      );
                    }}
                  >
                    <Button
                      size="small"
                      type="link"
                      className="text-light"
                      icon={<DeleteOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  </Popconfirm>
                </Flex>
              ),
              onClick: () => {
                restoreFiltres({
                  ...filtre.filtre,
                  debut: appAffichageFiltres.filtres.debut,
                  fin: appAffichageFiltres.filtres.fin,
                  page: 1,
                });
              },
            })),
            getPreferenceArray("filtresEvenement").length > 0
              ? {
                  type: "divider",
                  key: "divider",
                }
              : null,
            {
              key: "save",
              label: "Enregistrer comme nouveau filtre",
              onClick: () => {
                const nom = prompt("Nom du filtre:", "Nouveau filtre");
                const hasSameName = getPreferenceArray("filtresEvenement").some(
                  (f) => f.nom === nom,
                );
                if (hasSameName) {
                  message.error("Un filtre enregistré porte déjà ce nom").then();
                  return;
                }

                if (nom) {
                  setPreferenceArray("filtresEvenement", [
                    ...(getPreferenceArray("filtresEvenement") || []),
                    {
                      filtre: { ...appAffichageFiltres.filtres },
                      nom,
                      favori: false,
                    },
                  ]);
                  message.success("Filtre enregistré").then();
                }
              },
            },
            {
              key: "reset",
              label: "Retirer les filtres",
              onClick: () =>
                setFiltres(
                  {
                    ...initialAffichageFiltres.filtres,
                    debut: appAffichageFiltres.filtres.debut,
                    fin: appAffichageFiltres.filtres.fin,
                    type: typesEvenements?.items
                      .filter((t) => t.visibleParDefaut)
                      .filter((t) => t.actif)
                      .map((t) => t["@id"] as string),
                  },
                  true,
                ),
            },
          ],
        }}
      >
        <Button icon={<FilterOutlined />} type="dashed" className="mb-0 w-100">
          Filtres enregistrés
        </Button>
      </Dropdown>
    </li>
  );
}
