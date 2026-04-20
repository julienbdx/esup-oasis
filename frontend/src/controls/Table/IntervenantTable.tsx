/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { Button, Flex, Space, Table, Tooltip } from "antd";
import { IBeneficiaire, IIntervenant } from "@api/ApiTypeHelpers";
import { intervenantTableColumns } from "@controls/Table/IntervenantTableColumns";
import { RoleValues } from "@lib/Utilisateur";
import { useApi } from "@context/api/ApiProvider";
import { useDrawers } from "@context/drawers/DrawersContext";
import IntervenantTableExport from "@controls/Table/IntervenantTableExport";
import { useAuth } from "@/auth/AuthProvider";
import { initialAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { queryClient } from "@/queryClient";
import { SorterResult } from "antd/es/table/interface";
import { IntervenantTableFilter } from "@controls/Table/IntervenantTableFilter";
import Icon from "@ant-design/icons";
import Unfilter from "@/assets/images/unfilter.svg?react";
import { ascendToAsc } from "@utils/array";
import FiltreDescription from "@controls/Table/FiltreDescription";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";
import { useNavigate } from "react-router-dom";
import { getCountLibelle } from "@utils/table";

export interface FiltreIntervenant {
  nom?: string;
  prenom?: string;
  libelleCampus?: string;
  intervenantArchive?: boolean | "undefined"; // "undefined" is used to filter on null value
  "order[nom]"?: "asc" | "desc";
  page: number;
  itemsPerPage: number;
  "intervenant.campuses[]"?: string[];
  "intervenant.competences[]"?: string[];
  "intervenant.typesEvenements[]"?: string[];
}

export const FILTRE_INTERVENANT_DEFAULT: FiltreIntervenant = {
  "order[nom]": "asc",
  intervenantArchive: undefined,
  page: 1,
  itemsPerPage: 25,
};

export default function IntervenantTable() {
  const { setAffichageFiltres } = useAffichageFiltres();
  const { setDrawerUtilisateur } = useDrawers();
  const navigate = useNavigate();
  const [hasImpersonate, setHasImpersonate] = useState(false);
  const auth = useAuth();
  const [count, setCount] = React.useState<number>();
  const { getPreferenceArray, preferencesChargees } = usePreferences();

  const [filtreIntervenant, setFiltreIntervenant] = useState<FiltreIntervenant>({
    ...FILTRE_INTERVENANT_DEFAULT,
    // on applique le filtre favori des préférences de l'utilisateur s'il existe
    ...{
      ...getPreferenceArray("filtresIntervenant")?.filter((f) => f.favori)[0]?.filtre,
      page: 1,
    },
  });
  const { data: dataIntervenants, isFetching: isFetchingIntervenants } =
    useApi().useGetCollectionPaginated({
      path: "/intervenants",
      page: filtreIntervenant.page || 1,
      itemsPerPage: filtreIntervenant.itemsPerPage || 50,
      query: {
        ...filtreIntervenant,
        intervenantArchive:
          filtreIntervenant.intervenantArchive === "undefined"
            ? undefined
            : filtreIntervenant.intervenantArchive,
      },
    });

  useEffect(() => {
    if (auth.impersonate && hasImpersonate) {
      setAffichageFiltres(initialAffichageFiltres.affichage, initialAffichageFiltres.filtres);
      queryClient.clear();
    }
  }, [hasImpersonate, auth.impersonate, setAffichageFiltres]);

  useEffect(() => {
    if (preferencesChargees) {
      setFiltreIntervenant({
        ...FILTRE_INTERVENANT_DEFAULT,
        // on applique le filtre favori des préférences de l'utilisateur s'il existe
        ...getPreferenceArray("filtresIntervenant")?.filter((f) => f.favori)[0]?.filtre,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesChargees]);

  useEffect(() => {
    setCount(dataIntervenants?.totalItems);
  }, [dataIntervenants]);

  // Sticky header
  useEffect(() => {
    function handleScroll() {
      const table = document.querySelector("table") as HTMLElement;
      const tHead = document.querySelector(".ant-table-thead") as HTMLElement;
      tHead.style.top = `${document.documentElement.scrollTop - (table.getBoundingClientRect().top + window.scrollY - 80)}px`;
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <IntervenantTableFilter
        filtreIntervenant={filtreIntervenant}
        setFiltreIntervenant={setFiltreIntervenant}
      />
      <Flex justify="space-between" align="center">
        <span className="legende">{getCountLibelle(count, "intervenant")}</span>
        <div>
          {JSON.stringify(FILTRE_INTERVENANT_DEFAULT) !== JSON.stringify(filtreIntervenant) && (
            <Space.Compact>
              <FiltreDescription
                filtre={filtreIntervenant}
                as="modal"
                tooltip="Décrire le filtre en cours"
              />
              <Tooltip title="Retirer les filtres">
                <Button
                  className="d-flex-inline-center mr-1"
                  icon={<Icon component={Unfilter} aria-label="Retirer les filtres" />}
                  onClick={() => setFiltreIntervenant(FILTRE_INTERVENANT_DEFAULT)}
                />
              </Tooltip>
            </Space.Compact>
          )}
          <IntervenantTableExport filtreIntervenant={filtreIntervenant} />
        </div>
      </Flex>
      <Table<IIntervenant>
        loading={isFetchingIntervenants}
        dataSource={dataIntervenants?.items || []}
        className="table-responsive table-thead-sticky mt-2"
        pagination={{
          pageSize: filtreIntervenant.itemsPerPage || 50,
          total: dataIntervenants?.totalItems,
          current: filtreIntervenant.page,
          showSizeChanger: true,
          pageSizeOptions: [25, 50, 100, 200],
          onChange: (p, ps) => {
            setFiltreIntervenant({
              ...filtreIntervenant,
              page: p,
              itemsPerPage: ps,
            });
          },
          showTotal: (total, range) => (
            <div className="text-legende mr-1">
              {range[0]} à {range[1]} / {total}
            </div>
          ),
        }}
        rowKey={(record) => record["@id"] as string}
        rowClassName={(_record, index) => (index % 2 === 1 ? "bg-grey-xlight" : "")}
        onChange={(
          pagination,
          _filters,
          sorter: SorterResult<IBeneficiaire> | SorterResult<IBeneficiaire>[],
        ) => {
          if (Array.isArray(sorter)) {
            return;
          }
          if (sorter.field && sorter.field === "nom") {
            setFiltreIntervenant({
              ...filtreIntervenant,
              page: pagination.current || 1,
              itemsPerPage: pagination.pageSize || 50,
              "order[nom]": ascendToAsc(sorter.order),
            });
          } else {
            setFiltreIntervenant({
              ...filtreIntervenant,
              page: pagination.current || 1,
              itemsPerPage: pagination.pageSize || 50,
            });
          }
        }}
        columns={intervenantTableColumns({
          user: auth.user,
          filter: filtreIntervenant,
          setFilter: setFiltreIntervenant,
          onIntervenantSelected: (intervenant) => {
            setDrawerUtilisateur({
              utilisateur: intervenant["@id"],
              role: intervenant.roles?.includes(RoleValues.ROLE_RENFORT)
                ? RoleValues.ROLE_RENFORT
                : RoleValues.ROLE_INTERVENANT,
            });
          },
          onImpersonate: (intervenantUid) => {
            navigate("/");
            window.setTimeout(() => {
              setHasImpersonate(true);
              auth.setImpersonate(intervenantUid);
            }, 500);
          },
        })}
      />
    </>
  );
}
