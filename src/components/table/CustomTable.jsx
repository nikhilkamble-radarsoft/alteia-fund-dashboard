import { Select, Table, Input, Pagination } from "antd";
import useApi from "../../logic/useApi";
import { useEffect, useMemo, useState } from "react";
import { enhanceColumns } from "./TableUtils.jsx";
import { useThemedModal } from "../../logic/useThemedModal.jsx";

/**
 * CustomTable with server/client sorting and action column support
 *
 * ✅ Sorting Behavior
 * --------------------
 * Column config notes:
 * - Add `sortable: true` (or `sorter: true`) to enable sorting.
 * - (Optional) Provide `sorterFn: (a, b) => number` for custom client sorting.
 *
 * Server-side sorting:
 * - When `apiConfig.url` exists, sorting triggers API calls.
 * - Table sends `{ sortBy, sortOrder }` in params:
 *      sortBy: column.key or dataIndex
 *      sortOrder: "asc" | "desc"
 * - Backend should return sorted paginated results.
 *
 * Client-side sorting:
 * - Happens automatically when server mode is OFF.
 * - Custom `sorterFn` overrides default JS compare.
 *
 * Example sortable column:
 *   {
 *     title: "Name",
 *     dataIndex: "name",
 *     sortable: true,
 *   }
 *
 *
 * ✅ Action Column Behavior
 * -------------------------
 * To add actions to a column, provide an `actions` array:
 *
 * Each action object supports:
 *   label: string | (record) => ReactNode
 *   onClick: (record) => void
 *   disabled?: (record) => boolean
 *   icon?: ReactNode (optional)
 *
 * If you include:
 *   - 1 action → shown as a simple button/link
 *   - 2+ actions → shown inside a dropdown menu
 *
 * Example actions column:
 *   {
 *     title: "Actions",
 *     actions: [
 *       {
 *         label: (record) => record.status === "active" ? "View" : "Details",
 *         onClick: (record) => openDetails(record._id),
 *       },
 *       {
 *         label: "Delete",
 *         onClick: (record) => handleDelete(record._id),
 *         disabled: (record) => record.locked,
 *       }
 *     ]
 *   }
 *
 *
 * ✅ General Notes
 * ----------------
 * - Works in client mode AND server mode.
 * - Search + Pagination + Sorting + Action column support.
 * - Uses Ant Design v5 and Tailwind.
 *
 * Props to pay attention to:
 *   `apiConfig.url` → enables server mode
 *   `sortBy` + `sortOrder` → sent to server
 *   `actions` → custom row actions
 */

export default function CustomTable({
  columns = [],
  dataSource = [],
  apiConfig = {
    method: "get",
    url: "",
    params: {},
    data: {},
    fetchRefresh: null,
    dataAccessorKey: "data",
    totalAccessorKey: "totalRecords",
  },
  getTableData,
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(dataSource?.length || 0);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const { showError } = useThemedModal();

  const enhancedColumns = enhanceColumns({
    columns,
    // setSorter: (dataIndex) => setSortBy(dataIndex),
  });

  // Helpers to support nested dataIndex paths like "user_id.full_name"
  const toPathArray = (di) => {
    if (Array.isArray(di)) return di;
    if (typeof di === "string" && di.includes(".")) return di.split(".");
    return di != null ? [di] : [];
  };

  const getByPath = (obj, di) => {
    const path = toPathArray(di);
    return path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  };

  // Normalize columns so AntD can resolve nested values natively (array dataIndex)
  const normalizedColumns = useMemo(() => {
    return (enhancedColumns || []).map((col) => {
      if (col?.dataIndex && typeof col.dataIndex === "string" && col.dataIndex.includes(".")) {
        return { ...col, dataIndex: col.dataIndex.split(".") };
      }
      return col;
    });
  }, [enhancedColumns]);

  const sortedClientData = useMemo(() => {
    if (isServer) return tableData; // server returns already-sorted page
    if (!sortBy || !sortOrder) return tableData;

    // find column config for custom sorterFn (if provided)
    const colDef = enhancedColumns.find((c) => {
      const keyMatch = c.key === sortBy;
      const di = c.dataIndex;
      const diString = Array.isArray(di) ? di.join(".") : di;
      return keyMatch || diString === sortBy;
    });

    const sorterFn =
      colDef?.sorterFn ||
      ((a, b) => {
        const va = getByPath(a, sortBy);
        const vb = getByPath(b, sortBy);

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

  const displayedData = useMemo(() => {
    if (isServer) return tableData;
    const start = (page - 1) * pageSize;
    return (sortedClientData || []).slice(start, start + pageSize);
  }, [isServer, tableData, sortedClientData, page, pageSize]);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  const commonData = {
    page,
    limit: pageSize,
    search,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  };

  /** Server: fetch page from API */
  const fetchData = async () => {
    if (!isServer) return;
    const { method = "get", params = {}, data = {} } = apiConfig;

    const { response } = await callApi({
      ...apiConfig,
      params: {
        ...params,
        ...(method.toLowerCase() === "get" ? commonData : {}),
      },
      data: {
        ...data,
        ...(method.toLowerCase() !== "get" ? commonData : {}),
      },
    });

    const dataKey = apiConfig.dataAccessorKey || "data";
    const totalKey = apiConfig.totalAccessorKey || "totalRecords";

    setTableData(response?.[dataKey] || []);
    setTotal(response?.[totalKey] ?? 0);
    getTableData?.({ response: response[dataKey], meta: commonData });
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (isServer) {
      try {
        fetchData();
      } catch (error) {
        showError(error.message);
      }
    } else {
      const arr = dataSource.filter((d) =>
        Object.keys(d).some((key) =>
          d[key]?.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
      setTableData(arr);
      setTotal(arr.length || 0);
      getTableData?.({ response: arr, meta: commonData });
    }
  }, [page, pageSize, debouncedSearch, apiConfig.fetchRefresh, apiConfig.url, sortBy, sortOrder]);

  /** Client: sync incoming dataSource prop when not using server */
  useEffect(() => {
    if (!isServer) {
      const arr = dataSource || [];
      setTableData(arr);
      setTotal(arr.length || 0);

      // clamp page if out of range (e.g., data decreased or pageSize changed)
      const maxPage = Math.max(1, Math.ceil(arr.length / pageSize));
      if (page > maxPage) setPage(maxPage);
    }
    // only re-run when external dataSource or mode changes
  }, [dataSource, isServer, pageSize]);

  /** If pageSize changes, ensure page is still valid for client mode */
  useEffect(() => {
    if (!isServer) {
      const maxPage = Math.max(1, Math.ceil((dataSource?.length || 0) / pageSize));
      if (page > maxPage) setPage(maxPage);
    } else {
      setPage(1);
    }
  }, [pageSize, debouncedSearch]);

  const handleTableChange = (_, __, sorter) => {
    // sorter can be object or array (when multiple columns sort)
    const s = Array.isArray(sorter) ? sorter[0] : sorter || {};
    const order = s.order; // "ascend" | "descend" | undefined
    let columnKey = s.field || s.columnKey || s.column?.dataIndex || s.column?.key;
    // normalize array dataIndex to dot path string for internal state and server params
    if (Array.isArray(columnKey)) columnKey = columnKey.join(".");
    if (Array.isArray(s.column?.dataIndex)) columnKey = s.column.dataIndex.join(".");

    const resolvedOrder = order ? (order === "ascend" ? "asc" : "desc") : null;

    // update states
    setSortBy(columnKey || null);
    setSortOrder(resolvedOrder);

    // server should go to first page when sort changes
    // setPage(1);
    // fetchData will run via effect because sortBy/sortOrder are deps of fetchData
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-between">
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
        rowClassName={(_, index) => (index % 2 === 0 ? "!bg-gray-50" : "")}
        rowKey={rowKey}
        columns={normalizedColumns}
        dataSource={displayedData}
        loading={loading || apiLoading}
        onChange={handleTableChange}
        pagination={false}
        scroll={{ x: true }}
        className="rounded-lg"
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                className="bg-white !font-semibold !text-[15px] !py-3 whitespace-nowrap"
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
        <div className="flex flex-wrap gap-3 justify-center sm:justify-between items-center mt-3 text-sm text-gray-600">
          <span>
            Showing {showingFrom} to {showingTo} of {total} {total === 1 ? "item" : "items"}
          </span>

          <Pagination
            className="custom-pagination"
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
