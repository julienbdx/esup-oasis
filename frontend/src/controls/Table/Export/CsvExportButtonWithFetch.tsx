import { PaginateResult, useApi } from "@context/api/ApiProvider";
import React, { useEffect, useRef, useState } from "react";
import { Button, Progress } from "antd";
import {
  ApiPathMethodParameters,
  ApiPathMethodQuery,
  ApiPathMethodResponse,
  Path,
} from "@api/SchemaHelpers";
import { CSVLink } from "react-csv";
import { ExportOutlined } from "@ant-design/icons";
import { env } from "@/env";

type FetchItems<P extends Path> = PaginateResult<ApiPathMethodResponse<P, "get">>["items"];

export interface CsvExportButtonWithFetchProps<P extends Path, T extends object = object> {
  path: P;
  itemsPerPage: number;
  query?: ApiPathMethodQuery<P, "get">;
  parameters?: ApiPathMethodParameters<P, "get">;
  /** En-têtes CSV : tableau statique ou fonction calculée après récupération complète */
  headers:
    | { label: string; key: string }[]
    | ((items: FetchItems<P>) => { label: string; key: string }[]);
  filename: string;
  getData: (items: FetchItems<P>) => T[];
  /** Quand false, diffère le téléchargement jusqu'à ce que les données de référence soient prêtes */
  ready?: boolean;
  /** Appelé quand l'utilisateur clique sur le bouton d'export */
  onStart?: () => void;
  onDownloaded?: () => void;
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

/*
Ce composant est utilisé pour réaliser des exports de données en plusieurs requêtes, en utilisant un endpoint unique.
Pour des exports sur plusieurs endpoints ou demandant de retravailler les données, il est conseillé d'utiliser CsvExportButton.
 */
export default function CsvExportButtonWithFetch<P extends Path, T extends object = object>({
  path,
  itemsPerPage,
  query,
  parameters,
  headers,
  filename,
  getData,
  ready = true,
  onStart,
  onDownloaded,
  icon = <ExportOutlined />,
  label = "Exporter",
}: CsvExportButtonWithFetchProps<P, T>) {
  const [enabled, setEnabled] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refDownload = useRef<any>(null);

  const { data, isError, isSuccess, fetchedCount, totalItems } = useApi().useGetFullCollection({
    path,
    itemsPerPage,
    query,
    parameters,
    enabled,
  });

  // Déclenche le téléchargement dès que fetch + ready sont réunis
  useEffect(() => {
    if (refDownload.current && isSuccess && ready && !downloaded) {
      refDownload.current.link.click();
    }
  });

  if (!enabled) {
    return (
      <Button
        icon={icon}
        onClick={() => {
          setEnabled(true);
          onStart?.();
        }}
      >
        {label}
      </Button>
    );
  }

  if (!isSuccess) {
    return (
      <Progress
        style={{ width: 200 }}
        status={isError ? "exception" : undefined}
        percent={totalItems > 0 ? Math.min(100, Math.round((fetchedCount / totalItems) * 100)) : 0}
      />
    );
  }

  if (!ready) {
    return (
      <Button icon={<ExportOutlined />} loading disabled>
        Préparation des données...
      </Button>
    );
  }

  const csvHeaders =
    typeof headers === "function" ? headers(data!.items as FetchItems<P>) : headers;

  return (
    <CSVLink
      ref={refDownload}
      data={data ? getData(data.items as FetchItems<P>) : []}
      headers={csvHeaders}
      filename={`${env.REACT_APP_TITRE}-${filename}.csv`}
      separator=";"
      enclosingCharacter='"'
      onClick={() => {
        setDownloaded(true);
        onDownloaded?.();
      }}
      aria-label="Exporter le tableau au format CSV (Excel)"
    >
      <Button icon={<ExportOutlined />}>Exporter</Button>
    </CSVLink>
  );
}
