"use client";

import { columns } from "./columns";
import { filterFields } from "./constants";
import { DataTable } from "./data-table";
import { searchParamsCache, type ParsedSearchParams } from "./search-params";
import { Skeleton } from "./skeleton";
import { getCVs, type GetCVsParams } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [pageIndex, setPageIndex] = useLocalStorage<number>("tablePage", 0);
  const [pageSize, setPageSize] = useLocalStorage<number>("tablePageSize", 100);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('ultimo_contatto')) {
      url.searchParams.delete('ultimo_contatto');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const parsedSearch: ParsedSearchParams = {};
  try {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value) return;

      switch (key) {
        case 'tools':
        case 'database':
        case 'linguaggi_programmazione':
          parsedSearch[key] = Array.isArray(value) ? value : [value];
          break;

        case 'anni_esperienza':
        case 'stipendio_attuale':
        case 'stipendio_desiderato':
          const numArray = (Array.isArray(value) ? value : [value])
            .map(v => parseInt(v, 10))
            .filter(n => !isNaN(n));
          if (numArray.length === 2) {
            parsedSearch[key] = numArray as [number, number];
          }
          break;

        case 'ultimo_contatto':
          const contactDateArray = (Array.isArray(value) ? value : [value])
            .map(v => new Date(parseInt(v)))
            .filter(d => !isNaN(d.getTime()));
          if (contactDateArray.length > 0) {
            parsedSearch[key] = contactDateArray;
          }
          break;

        case 'created_at':
          const createdDateArray = (Array.isArray(value) ? value : [value])
            .map(v => {
              const timestamp = parseInt(v);
              if (isNaN(timestamp)) return null;
              return new Date(timestamp);
            })
            .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
          if (createdDateArray.length > 0) {
            parsedSearch[key] = createdDateArray;
          }
          break;
      }
    });
  } catch (error) {
    console.error('Error parsing search params:', error);
  }

  const { data: cvData, isLoading } = useQuery({
    queryKey: ['cvs', parsedSearch, pageIndex, pageSize],
    queryFn: async () => {
      try {
        const params: GetCVsParams = {
          page: pageIndex + 1,
          page_size: pageSize,
          tools: parsedSearch.tools,
          database: parsedSearch.database,
          linguaggi_programmazione: parsedSearch.linguaggi_programmazione,
          ultimo_contatto: parsedSearch.ultimo_contatto,
          created_at: parsedSearch.created_at,
        };

        if (parsedSearch.anni_esperienza?.length === 2) {
          params.anni_esperienza = parsedSearch.anni_esperienza as [number, number];
        }
        if (parsedSearch.stipendio_attuale?.length === 2) {
          params.stipendio_attuale = parsedSearch.stipendio_attuale as [number, number];
        }
        if (parsedSearch.stipendio_desiderato?.length === 2) {
          params.stipendio_desiderato = parsedSearch.stipendio_desiderato as [number, number];
        }
        if (parsedSearch.ultimo_contatto?.length) {
          params.ultimo_contatto = parsedSearch.ultimo_contatto;
        }

        return await getCVs(params);
      } catch (error) {
        console.error('Error fetching data:', error);
        return { items: [], total: 0, page: 1, page_size: 100 };
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Skeleton />;

  return (
    <React.Suspense fallback={<Skeleton />}>
      <DataTable
        columns={columns}
        data={cvData?.items ?? []}
        total={cvData?.total}
        filterFields={filterFields}
        defaultColumnFilters={Object.entries(parsedSearch)
          .map(([key, value]) => ({
            id: key,
            value,
          }))
          .filter(({ value }) => value !== undefined)}
        pagination={{
          pageIndex: pageIndex,
          pageSize,
          pageCount: Math.ceil((cvData?.total ?? 0) / pageSize),
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
        }}
      />
    </React.Suspense>
  );
}
