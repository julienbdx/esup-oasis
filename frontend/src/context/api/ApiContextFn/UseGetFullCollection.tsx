/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useQueries, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PaginateResult, RequestMethod } from "@context/api/ApiProvider";
import {
  ApiPathMethodParameters,
  ApiPathMethodQuery,
  ApiPathMethodResponse,
  Path,
} from "@api/SchemaHelpers";
import { buildUrl } from "@context/api/ApiContextFn/UrlBuilder";
import {
  handleApiResponse,
  IErreurNotification,
} from "@context/api/ApiContextFn/HandleApiResponse";
import { useAuth } from "@/auth/AuthProvider";

const DEFAULT_ITEMS_PER_PAGE = 200;
const DEFAULT_CONCURRENCY = 5;

export type UseGetFullCollectionHook = <P extends Path>(options: {
  path: P;
  query?: ApiPathMethodQuery<P, "get">;
  enabled?: boolean;
  parameters?: ApiPathMethodParameters<P, "get">;
  onError?: (error: IErreurNotification) => void;
  itemsPerPage?: number;
  concurrency?: number;
}) => {
  data: PaginateResult<ApiPathMethodResponse<P, "get">> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
};

export function useGetFullCollection<P extends Path>(
  baseUrl: string,
  fetchOptions: RequestInit,
  options: {
    path: P;
    query?: ApiPathMethodQuery<P, "get">;
    enabled?: boolean;
    parameters?: ApiPathMethodParameters<P, "get">;
    onError?: (error: IErreurNotification) => void;
    itemsPerPage?: number;
    concurrency?: number;
  },
) {
  const PAGE_SIZE = options.itemsPerPage ?? DEFAULT_ITEMS_PER_PAGE;
  const CONCURRENCY = options.concurrency ?? DEFAULT_CONCURRENCY;
  const navigate = useNavigate();
  const auth = useAuth();
  const isEnabled = options.enabled !== false;

  // Résultats du rendu précédent pour piloter le déclenchement par tranche (sliding window)
  const prevResultsRef = useRef<Array<{ isSuccess: boolean; isError: boolean }>>([]);

  const buildPageUrl = (page: number): URL =>
    buildUrl<P, "get">(baseUrl, options.path, undefined, options.parameters, {
      ...options.query,
      page,
      itemsPerPage: PAGE_SIZE,
    } as ApiPathMethodQuery<P, "get">);

  const makeFetchFn = (page: number) => async () => {
    const url = buildPageUrl(page);
    const data = await handleApiResponse(
      RequestMethod.GET,
      await fetch(url, { method: "GET", ...fetchOptions }),
      navigate,
      auth,
      options,
      undefined,
      options.onError,
    );
    return {
      items: data["hydra:member"],
      totalItems: data["hydra:totalItems"],
      currentPage: page,
      itemsPerPage: PAGE_SIZE,
    } as PaginateResult<ApiPathMethodResponse<P, "get">>;
  };

  const page1Url = buildPageUrl(1);
  const page1 = useQuery({
    queryKey: [options.path, page1Url, auth.user?.uid],
    queryFn: makeFetchFn(1),
    enabled: isEnabled && Boolean(page1Url),
  });

  const totalItems = page1.data?.totalItems ?? 0;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;
  const remainingPageNumbers = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2);

  const remainingQueries = useQueries({
    queries: remainingPageNumbers.map((page, idx) => {
      // La requête à l'index idx ne démarre que lorsque la requête à (idx - CONCURRENCY)
      // est terminée, ce qui crée une fenêtre glissante de CONCURRENCY requêtes simultanées.
      const prerequisiteIdx = idx - CONCURRENCY;
      const prerequisiteDone =
        prerequisiteIdx < 0 ||
        prevResultsRef.current[prerequisiteIdx]?.isSuccess === true ||
        prevResultsRef.current[prerequisiteIdx]?.isError === true;

      const url = buildPageUrl(page);
      return {
        queryKey: [options.path, url, auth.user?.uid],
        queryFn: makeFetchFn(page),
        enabled: isEnabled && !!page1.data && prerequisiteDone,
      };
    }),
  });

  // Mise à jour de la ref après chaque rendu pour le prochain cycle
  prevResultsRef.current = remainingQueries.map((q) => ({
    isSuccess: q.isSuccess,
    isError: q.isError,
  }));

  const allDone =
    page1.isSuccess && (totalPages <= 1 || remainingQueries.every((q) => q.isSuccess || q.isError));

  const page1Items = (page1.data?.items ?? []) as unknown[];
  const remainingItems = remainingQueries.flatMap((q) => (q.data?.items ?? []) as unknown[]);
  const allItems = [...page1Items, ...remainingItems] as PaginateResult<
    ApiPathMethodResponse<P, "get">
  >["items"];

  return {
    data: allDone
      ? ({
          items: allItems,
          totalItems,
          currentPage: 1,
          itemsPerPage: PAGE_SIZE,
        } as PaginateResult<ApiPathMethodResponse<P, "get">>)
      : undefined,
    isLoading: page1.isLoading || remainingQueries.some((q) => q.isLoading),
    isFetching: page1.isFetching || remainingQueries.some((q) => q.isFetching),
    isError: page1.isError || remainingQueries.some((q) => q.isError),
    isSuccess: allDone,
  };
}
