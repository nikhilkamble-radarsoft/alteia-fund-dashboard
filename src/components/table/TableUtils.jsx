import { Dropdown, Menu, Button } from "antd";
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
    if (!col.actions?.length) {
      return {
        ...col,
        sorter: true,
        sorterIcon: customSortIcon,
        key: col.key ?? col.dataIndex ?? `col-${i}`,
      };
    }

    return {
      ...col,
      key: col.key ?? col.dataIndex ?? `col-${i}`,
      render: (_, record) => {
        const availableActions = col.actions.filter((a) => (a.visible ? a.visible(record) : true));

        // ✅ Single action → show link/button directly
        if (availableActions.length === 1) {
          const action = availableActions[0];
          const disabled = action.disabled?.(record);

          return (
            <Button
              type="link"
              disabled={disabled}
              onClick={() => !disabled && action.onClick(record)}
              className="p-0"
            >
              {typeof action.label === "function" ? action.label?.(record) : action.label}
            </Button>
          );
        }

        // ✅ Multiple actions → dropdown menu
        const items = availableActions.map((action, idx) => ({
          key: idx,
          label: (
            <Button
              onClick={() => !action.disabled?.(record) && action.onClick(record)}
              className={`text-primary border-none bg-transparent ${
                action.disabled?.(record) ? "pointer-events-none opacity-40" : "cursor-pointer"
              }`}
            >
              {typeof action.label === "function" ? action.label?.(record) : action.label}
            </Button>
          ),
        }));

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" className="p-0">
              <MoreOutlined className="text-lg text-primary" />
            </Button>
          </Dropdown>
        );
      },
    };
  });
};
