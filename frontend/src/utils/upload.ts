/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import { RcFile } from "antd/es/upload";
import { ITelechargement } from "@api";
import { AuthContextType } from "@/auth/AuthProvider";
import { env } from "@/env";
import { logger } from "@utils/logger";

export async function envoyerFichierFetch(
  apiUrl: string,
  auth: AuthContextType,
  file: string | Blob | RcFile,
  onSuccess: (pj: ITelechargement) => void,
  onError?: (err: Error) => void,
) {
  const fmData = new FormData();
  fmData.append("file", file);

  const fetchOptions: RequestInit = {
    method: "POST",
    body: fmData,
    credentials: "include",
  };

  if (auth.impersonate) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "X-Switch-User": auth.impersonate,
    };
  }

  try {
    const response = await fetch(
      `${apiUrl}${env.REACT_APP_API_PREFIX}/telechargements`,
      fetchOptions,
    );
    if (response.ok) {
      const json = await response.json();
      onSuccess(json);
    } else {
      logger.error("Error:", response);
      onError?.(new Error("Upload error"));
    }
  } catch (err) {
    logger.error("Error:", err);
    onError?.(new Error("Upload error"));
  }
}
