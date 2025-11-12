import { Typography, Button, Divider } from "antd";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { fundPurchaseStatus, tradeStatus } from "../../utils/constants";
import CustomTag from "../../components/common/CustomTag";
import { formatDate } from "../../utils/utils";

const { Title } = Typography;

export default function FundPurchases() {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Fund Name",
      dataIndex: "fund.title",
      render: (text, record) => (
        <NavLink to={`/purchase/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: "Investor Name",
      dataIndex: "user.full_name",
    },
    {
      title: "Amount",
      dataIndex: "user_amount",
    },
    {
      title: "Units",
      dataIndex: "fund_unit",
    },
    {
      title: "Date",
      dataIndex: "purchase_date",
      render: (text) => formatDate(text),
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (text) => {
    //     let finalText = text?.toLowerCase();
    //     let finalVariant, customColors;
    //     switch (text) {
    //       case fundPurchaseStatus.completed:
    //         finalText = "Completed";
    //         finalVariant = "success";
    //         break;
    //       case fundPurchaseStatus.pending:
    //         finalText = "Pending";
    //         finalVariant = "warning";
    //         break;
    //       case fundPurchaseStatus.in_progress:
    //         finalText = "In Progress";
    //         finalVariant = "upcoming";
    //         break;
    //       case fundPurchaseStatus.cancelled:
    //         finalText = "Cancelled";
    //         finalVariant = "danger";
    //         break;
    //       default:
    //         break;
    //     }
    //     return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
    //   },
    // },
  ];

  return (
    <div>
      <TableTitle
        title="Purchase Listing"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text="Add New Purchase"
            showIcon
            onClick={() => navigate("/purchase/create")}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/purchase/list",
          totalAccessorKey: "totalRecords",
        }}
      />
    </div>
  );
}
