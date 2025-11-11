import { Typography, Button, Divider } from "antd";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { tradeStatus } from "../../utils/constants";
import CustomTag from "../../components/common/CustomTag";

const { Title } = Typography;

export default function Trades() {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Trade Title",
      dataIndex: "title",
      render: (text, record) => (
        <NavLink to={`/trades/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "ROI %",
      dataIndex: "roi_range",
      render: (text, record) =>
        `${text?.endsWith("%") ? text : `${text}%`} ${
          record.ytd_return ? `(YTD ${record.ytd_return})` : ""
        }`,
    },
    {
      title: "Min. Investment",
      dataIndex: "minimum_investment",
      render: (text) => {
        const num = parseFloat(text);

        if (!isNaN(num)) {
          return `$${num.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}`;
        }

        return text;
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case tradeStatus.active:
            finalText = "Active";
            finalVariant = "success";
            break;
          case tradeStatus.inactive:
            finalText = "Inactive";
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
  ];

  return (
    <div>
      <TableTitle
        title="Trades Listing"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton text="Add New Trade" showIcon onClick={() => navigate("/trades/create")} />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/get-trade-list",
          method: "post",
        }}
      />
    </div>
  );
}
