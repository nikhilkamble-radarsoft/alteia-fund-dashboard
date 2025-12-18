import React, { useMemo, useState } from "react";
import { Modal, Input } from "antd";
import VirtualList from "rc-virtual-list";
import { renderToStaticMarkup } from "react-dom/server";
import DOMPurify from "dompurify";
import * as FiIcons from "react-icons/fi";
import * as MdIcons from "react-icons/md";
import { useMediaQuery } from "react-responsive";

const ICON_MODULES = { Fi: FiIcons, Md: MdIcons };

function chunkIntoRows(list, columns) {
  const rows = [];
  for (let i = 0; i < list.length; i += columns) {
    rows.push(list.slice(i, i + columns));
  }
  return rows;
}

// build once (IMPORTANT)
const ICON_LIST = Object.values(ICON_MODULES)
  .flatMap((mod) =>
    Object.entries(mod)
      .filter(([, Comp]) => typeof Comp === "function")
      .map(([name, Comp]) => ({ name, Comp }))
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export default function IconPicker({ value, onChange, placeholder = "Choose icon" }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const COLUMNS = isMobile ? 3 : 6;
  const ROW_HEIGHT = 96;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? ICON_LIST.filter((i) => i.name.toLowerCase().includes(q)) : ICON_LIST;
  }, [query]);

  const selectIcon = (item) => {
    const rawSvg = renderToStaticMarkup(<item.Comp size={24} color="currentColor" />);

    const cleanSvg = DOMPurify.sanitize(rawSvg, {
      USE_PROFILES: { svg: true },
    });

    const viewBox = rawSvg.match(/viewBox="([^"]+)"/)?.[1] || "0 0 24 24";

    onChange({
      name: item.name,
      svg: cleanSvg,
      viewBox,
    });

    setOpen(false);
    setQuery("");
  };

  const rows = useMemo(() => chunkIntoRows(filtered, COLUMNS), [filtered]);

  return (
    <>
      <div
        className="border rounded-lg px-3 py-2 cursor-pointer flex items-center gap-3"
        onClick={() => setOpen(true)}
      >
        {value?.svg ? (
          <>
            <SvgIcon svg={value.svg} size={20} /> {value.name}
          </>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      <Modal
        open={open}
        title="Select Icon"
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
      >
        <Input
          placeholder="Search icons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          allowClear
          className="mb-3"
        />

        <VirtualList data={rows} height={420} itemHeight={ROW_HEIGHT} itemKey={(_, index) => index}>
          {(row) => (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 px-2">
              {row.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectIcon(item)}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
                  type="button"
                >
                  <item.Comp size={22} />
                  <span className="text-xs truncate w-full text-center">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </VirtualList>
      </Modal>
    </>
  );
}

/* ---------- SVG RENDERER ---------- */

export function SvgIcon({ svg, size = 20, color = "currentColor" }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        color,
        display: "inline-flex",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
