import { useApi } from "@context/api/ApiProvider";
import React, { useEffect, useRef, useState } from "react";
import { Button, Progress } from "antd";
import { ApiPathMethodQuery, ApiPathMethodResponse } from "@api/SchemaHelpers";

export default function SplitFetcher<T = ApiPathMethodResponse<"/amenagements", "get">>(props: {
   itemsPerPage: number;
   query?: ApiPathMethodQuery<"/amenagements", "get">;
   setData: (data: T[]) => void;
   setIsFetching: (isFetching: boolean) => void;
   icon?: React.ReactNode;
   label?: React.ReactNode;
}) {
   const [enabled, setEnabled] = useState(false);
   const [page, setPage] = useState(1);
   const [totalItems, setTotalItems] = useState<number | null>(null);
   // Ref pour accumuler les pages sans déclencher de re-rendu intermédiaire
   const allDataRef = useRef<T[]>([]);

   const { data } = useApi().useGetCollectionPaginated({
      path: "/amenagements",
      page: page,
      itemsPerPage: props.itemsPerPage, // NB_MAX_ITEMS_PER_PAGE,
      query: props.query,
      enabled: enabled,
   });

   useEffect(() => {
      if (!data) return;

      props.setIsFetching(true);
      setTotalItems(data.totalItems);
      allDataRef.current = [...allDataRef.current, ...((data.items as T[]) || [])];

      if (page * props.itemsPerPage < data.totalItems) {
         setPage((prevPage) => prevPage + 1);
      } else {
         props.setData(allDataRef.current);
         props.setIsFetching(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [data]);

   return enabled ? (
      <Progress
         style={{ width: 200 }}
         percent={
            totalItems ? Math.round(((page * props.itemsPerPage) / (totalItems || 1)) * 100) : 0
         }
      />
   ) : (
      <Button icon={props.icon} onClick={() => setEnabled(true)}>
         {props.label}
      </Button>
   );
}
