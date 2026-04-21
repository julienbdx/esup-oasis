/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useRef, useState } from "react";
import { Button, Flex, Space, Table } from "antd";
import { IBeneficiaire, IIntervenant } from "@api/ApiTypeHelpers";
import { intervenantTableColumns } from "@controls/Table/IntervenantTableColumns";
import { RoleValues } from "@lib/Utilisateur";
import { useApi } from "@context/api/ApiProvider";
import { useDrawers } from "@context/drawers/DrawersContext";
import IntervenantTableExport from "@controls/Table/IntervenantTableExport";
import { useAuth } from "@/auth/AuthProvider";
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

const SESSION_KEY_FILTRE_INTERVENANT = "oasis:filter:intervenant";

export default function IntervenantTable() {
  const { setDrawerUtilisateur } = useDrawers();
  const navigate = useNavigate();
  const auth = useAuth();
  const { getPreferenceArray, preferencesChargees } = usePreferences();

  const hadSessionFilter = useRef(!!sessionStorage.getItem(SESSION_KEY_FILTRE_INTERVENANT));

  const [filtreIntervenant, setFiltreIntervenant] = useState<FiltreIntervenant>(() => {
    // Priorité 1 : filtre de session
    try {
      const stored = sessionStorage.getItem(SESSION_KEY_FILTRE_INTERVENANT);
      if (stored) return JSON.parse(stored) as FiltreIntervenant;
    } catch {
      /* ignore */
    }
    // Priorité 2 : filtre favori des préférences
    return {
      ...FILTRE_INTERVENANT_DEFAULT,
      ...{
        ...getPreferenceArray("filtresIntervenant")?.filter((f) => f.favori)[0]?.filtre,
        page: 1,
      },
    };
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

  // Persiste le filtre en session à chaque changement
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY_FILTRE_INTERVENANT, JSON.stringify(filtreIntervenant));
  }, [filtreIntervenant]);

  useEffect(() => {
    if (preferencesChargees && !hadSessionFilter.current) {
      setFiltreIntervenant({
        ...FILTRE_INTERVENANT_DEFAULT,
        // on applique le filtre favori des préférences de l'utilisateur s'il existe
        ...getPreferenceArray("filtresIntervenant")?.filter((f) => f.favori)[0]?.filtre,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferencesChargees]);

  const count = dataIntervenants?.totalItems;

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
              <Button
                className="d-flex-inline-center mr-1"
                icon={<Icon component={Unfilter} aria-label="Retirer les filtres" />}
                onClick={() => setFiltreIntervenant(FILTRE_INTERVENANT_DEFAULT)}
              >
                Retirer les filtres
              </Button>
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
            navigate(`/impersonate/${intervenantUid}`);
          },
        })}
      />
    </>
  );
}
