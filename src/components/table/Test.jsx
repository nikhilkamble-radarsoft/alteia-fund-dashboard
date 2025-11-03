import { Select, Table, Input, Pagination } from "antd";
import useApi from "../../logic/useApi";
import { useEffect, useMemo, useState, useCallback } from "react";
import { enhanceColumns } from "./TableUtils.jsx";

/**
 * CustomTable with server/client sorting
 *
 * Column config notes:
 * - Make a column sortable by adding `sortable: true` (or `sorter: true`).
 * - Optionally provide `sorterFn: (a, b) => number` on the column for custom client-side compare.
 */

export default function CustomTable({
  columns = [],
  dataSource = [],
  apiConfig = {
    method: "get",
    url: "",
    params: {},
    fetchRefresh: null,
    dataAccessorKey: "data",
    metaKey: "meta", // optional { total }
  },
  loading = false,
  showPagination = true,
  showSearch = true,
  rowKey = "_id",
}) {
  const { callApi, loading: apiLoading } = useApi();

  const isServer = Boolean(apiConfig?.url);

  // full data (for client mode) or server-returned page (for server mode)
  const [tableData, setTableData] = useState(dataSource || []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(dataSource?.length || 0);

  // Sorting state: column key (dataIndex or key) and order "asc" | "desc" | null
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  // Enhance columns (keeps your existing enhanceColumns behavior) and add sorter flags
  const enhancedColumns = useMemo(() => {
    const base = enhanceColumns({ columns });
    return base.map((col) => {
      // allow either `sortable: true` or `sorter: true` in incoming config
      if (col.sortable || col.sorter) {
        return { ...col, sorter: true };
      }
      return col;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // ---- Client-side: compute sorted data (apply search/filter already kept in tableData) ----
  const sortedClientData = useMemo(() => {
    if (isServer) return tableData; // server returns already-sorted page
    if (!sortBy || !sortOrder) return tableData;

    // find column config for custom sorterFn (if provided)
    const colDef = enhancedColumns.find((c) => c.dataIndex === sortBy || c.key === sortBy);

    const sorterFn =
      colDef?.sorterFn ||
      ((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];

        // handle null/undefined
        if (va == null && vb == null) return 0;
        if (va == null) return -1;
        if (vb == null) return 1;

        // numbers
        if (typeof va === "number" && typeof vb === "number") return va - vb;

        // dates (ISO strings or dayjs objects)
        const da = new Date(va);
        const db = new Date(vb);
        if (!isNaN(da) && !isNaN(db)) {
          return da - db;
        }

        // fallback to locale compare
        return String(va).localeCompare(String(vb), undefined, { numeric: true });
      });

    const sorted = [...tableData].sort((a, b) => {
      const res = sorterFn(a, b);
      return sortOrder === "asc" ? res : -res;
    });

    return sorted;
  }, [isServer, tableData, sortBy, sortOrder, enhancedColumns]);

  // displayedData (server: tableData already page data; client: slice sortedClientData)
  const displayedData = useMemo(() => {
    if (isServer) return tableData;
    const start = (page - 1) * pageSize;
    return (sortedClientData || []).slice(start, start + pageSize);
  }, [isServer, tableData, sortedClientData, page, pageSize]);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  /** Server: fetch page from API (now includes sortBy & sortOrder) */
  const fetchData = useCallback(async () => {
    if (!isServer) return;
    const { response, status } = await callApi({
      ...apiConfig,
      params: {
        ...apiConfig.params,
        page,
        limit: pageSize,
        search,
        // pass sort info if present
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),
      },
    });

    if (status) {
      const dataKey = apiConfig.dataAccessorKey || "data";
      const metaKey = apiConfig.metaKey || "meta";

      setTableData(response[dataKey] || []);
      setTotal(response[metaKey]?.total ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callApi, apiConfig, page, pageSize, search, sortBy, sortOrder, isServer]);

  useEffect(() => {
    if (isServer) fetchData();
    else {
      // Client-side: filter incoming dataSource using search
      const arr = (dataSource || []).filter((d) =>
        Object.keys(d).some((key) => {
          const val = d[key];
          if (val == null) return false;
          return String(val).toLowerCase().includes(search.toLowerCase());
        })
      );

      setTableData(arr);
      setTotal(arr.length || 0);

      // clamp page if out of range
      const maxPage = Math.max(1, Math.ceil(arr.length / pageSize));
      if (page > maxPage) setPage(maxPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    search,
    apiConfig.fetchRefresh,
    apiConfig.url,
    dataSource,
    sortBy,
    sortOrder,
  ]);

  // sync incoming dataSource when not using server (keeps tableData in sync)
  useEffect(() => {
    if (!isServer) {
      const arr = dataSource || [];
      setTableData(arr);
      setTotal(arr.length || 0);

      const maxPage = Math.max(1, Math.ceil(arr.length / pageSize));
      if (page > maxPage) setPage(maxPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, isServer, pageSize]);

  // When pageSize changes, reset page (server resets to 1; client clamp handled above)
  useEffect(() => {
    if (!isServer) {
      const maxPage = Math.max(1, Math.ceil((dataSource?.length || 0) / pageSize));
      if (page > maxPage) setPage(maxPage);
    } else {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, search]);

  // ---- Handle Table's onChange to capture sorting ----
  const handleTableChange = (_, __, sorter) => {
    // sorter can be object or array (when multiple columns sort)
    const s = Array.isArray(sorter) ? sorter[0] : sorter || {};
    const order = s.order; // "ascend" | "descend" | undefined
    const columnKey = s.field || s.columnKey || s.column?.dataIndex || s.column?.key;

    const resolvedOrder = order ? (order === "ascend" ? "asc" : "desc") : null;

    // update states
    setSortBy(columnKey || null);
    setSortOrder(resolvedOrder);

    // server should go to first page when sort changes
    setPage(1);
    // fetchData will run via effect because sortBy/sortOrder are deps of fetchData
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {showPagination && (
          <div className="flex items-center gap-2 text-sm">
            <Select
              value={pageSize}
              onChange={(val) => {
                setPageSize(val);
              }}
              options={[2, 5, 10].map((v) => ({ label: v, value: v }))}
              className="w-20"
            />
            <span className="text-gray-600">entries per page</span>
          </div>
        )}

        {showSearch && (
          <Input
            placeholder="Search:"
            className="w-60"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onPressEnter={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
          />
        )}
      </div>

      {/* Table */}
      <Table
        rowKey={rowKey}
        columns={enhancedColumns}
        dataSource={displayedData}
        loading={loading || apiLoading}
        pagination={false}
        onChange={handleTableChange}
        scroll={{ x: true }}
        className="rounded-lg"
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                className="!bg-white !font-semibold !text-[15px] !py-3 whitespace-nowrap"
              />
            ),
          },
          body: {
            cell: (props) => <td {...props} className="!py-3 whitespace-nowrap" />,
          },
        }}
      />

      {/* Bottom row: total left, pagination right */}
      {showPagination && (
        <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
          <span>
            Showing {showingFrom} to {showingTo} of {total} {total === 1 ? "item" : "items"}
          </span>

          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
