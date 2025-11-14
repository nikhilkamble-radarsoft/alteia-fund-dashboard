import { Dropdown, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const customSortIcon = ({ sortOrder }) => (
  <span className="flex flex-col ml-1">
    <piUpOutlined
      className={`text-xs ${sortOrder === "ascend" ? "text-primary" : "text-gray-400"}`}
    />
    <DownOutlined
      className={`text-xs -mt-1 ${sortOrder === "descend" ? "text-primary" : "text-gray-400"}`}
    />
  </span>
);

export const enhanceColumns = ({ columns }) => {
  return columns.map((col, i) => {
    const hasActions = !!col.actions;

    if (!hasActions) {
      return {
        ...col,
        // sorter: true, // Enable this line to make all non-action columns sortable
        sorterIcon: customSortIcon,
        key: col.key ?? col.dataIndex ?? `col-${i}`,
      };
    }

    return {
      ...col,
      align: "center",
      // fixed: "right", // TODO: ask jeet sir
      key: col.key ?? col.dataIndex ?? `col-${i}`,
      render: (_, record, index) => {
        const rawActions =
          typeof col.actions === "function" ? col.actions(record, index) : col.actions || [];

        if (!rawActions.length) return null;

        const availableActions = rawActions.filter((a) =>
          typeof a?.visible === "function"
            ? a?.visible?.(record, index)
            : a?.visible !== undefined
            ? a?.visible
            : true
        );

        if (!availableActions.length) return null;

        // ✅ Single action → show link/button directly
        // if (availableActions.length === 1) {
        //   const action = availableActions[0];
        //   const disabled = action.disabled?.(record, index);

        //   return (
        //     <Button
        //       type="link"
        //       disabled={disabled}
        //       onClick={() => !disabled && action.onClick(record, index)}
        //       className="p-0"
        //     >
        //       {typeof action.label === "function" ? action.label?.(record, index) : action.label}
        //     </Button>
        //   );
        // }

        // ✅ Multiple actions → dropdown menu
        const items = availableActions.map((action, idx) => ({
          key: idx,
          label:
            typeof action.label === "function" ? (
              action.label?.(record, index)
            ) : (
              <span className="text-primary">{action.label}</span>
            ),
          onClick: () => !action.disabled?.(record, index) && action.onClick(record, index),
          disabled: action.disabled?.(record, index),
          className: action.disabled?.(record, index) ? "opacity-40" : "",
        }));

        return (
          <Dropdown align="bottom" menu={{ items }} trigger={["click"]}>
            <Button type="text" className="p-0">
              <MoreOutlined className="text-lg text-primary" />
            </Button>
          </Dropdown>
        );
      },
    };
  });
};
