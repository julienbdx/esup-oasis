/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { CSVLink } from "react-csv";
import { ExportOutlined } from "@ant-design/icons";
import { env } from "@/env";

interface ExportButtonProps<T extends object = object> {
  getData: () => T[];
  headers: { label: string; key: string }[];
  filename: string;
  /** Quand false, diffère le téléchargement jusqu'à ce que les données de référence soient prêtes */
  ready?: boolean;
  /** Appelé quand l'utilisateur clique sur le bouton d'export */
  onStart?: () => void;
  onDownloaded?: () => void;
  icon?: React.ReactNode;
  label?: React.ReactNode;
}

export default function ExportButton<T extends object = object>({
  getData,
  headers,
  filename,
  ready = true,
  onStart,
  onDownloaded,
  icon = <ExportOutlined />,
  label = "Exporter",
}: ExportButtonProps<T>) {
  const [started, setStarted] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refDownload = useRef<any>(null);

  // Déclenche le téléchargement dès que started + ready sont réunis
  useEffect(() => {
    if (refDownload.current && started && ready && !downloaded) {
      refDownload.current.link.click();
    }
  });

  if (!started) {
    return (
      <Button
        icon={icon}
        onClick={() => {
          setStarted(true);
          onStart?.();
        }}
      >
        {label}
      </Button>
    );
  }

  if (!ready) {
    return (
      <Button icon={<ExportOutlined />} loading disabled>
        Préparation des données...
      </Button>
    );
  }

  return (
    <CSVLink
      ref={refDownload}
      data={getData()}
      headers={headers}
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
