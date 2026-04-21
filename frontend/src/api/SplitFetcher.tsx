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

export interface SplitFetcherProps<P extends Path, T extends object = object> {
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

export default function SplitFetcher<P extends Path, T extends object = object>({
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
}: SplitFetcherProps<P, T>) {
  const [enabled, setEnabled] = useState(false);
  const [page, setPage] = useState(1);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [fetchedItems, setFetchedItems] = useState<FetchItems<P> | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const { data, isError } = useApi().useGetCollectionPaginated({
    path,
    page,
    itemsPerPage,
    query,
    parameters,
    enabled,
  });

  // Accumule les pages sans déclencher de re-rendu intermédiaire
  const allDataRef = useRef<unknown[]>([]);
  // Persiste le total même quand data est undefined entre deux chargements de pages
  const totalItemsRef = useRef<number | null>(null);
  // Empêche la double exécution de l'effet en React StrictMode
  const lastProcessedDataRef = useRef<typeof data | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refDownload = useRef<any>(null);

  useEffect(() => {
    if (!data || data === lastProcessedDataRef.current) return;
    lastProcessedDataRef.current = data;

    if (totalItemsRef.current === null) {
      totalItemsRef.current = data.totalItems;
    }

    allDataRef.current = [...allDataRef.current, ...(data.items as unknown[])];
    setFetchedCount(allDataRef.current.length);

    if (allDataRef.current.length < data.totalItems) {
      Promise.resolve().then(() => setPage((p) => p + 1));
    } else {
      setFetchedItems(allDataRef.current as unknown as FetchItems<P>);
      setFetchComplete(true);
    }
  }, [data]);

  // Déclenche le téléchargement dès que fetch + ready sont réunis
  useEffect(() => {
    if (refDownload.current && fetchComplete && ready && !downloaded) {
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

  if (!fetchComplete) {
    return (
      <Progress
        style={{ width: 200 }}
        status={isError ? "exception" : undefined}
        percent={
          totalItemsRef.current
            ? Math.min(100, Math.round((fetchedCount / totalItemsRef.current) * 100))
            : 0
        }
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
    typeof headers === "function" ? headers(fetchedItems as FetchItems<P>) : headers;

  return (
    <CSVLink
      ref={refDownload}
      data={fetchedItems ? getData(fetchedItems) : []}
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
