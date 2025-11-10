import { Typography, Button, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { tradeStatus } from "../../utils/constants";
import CustomTag from "../../components/common/CustomTag";

const { Title } = Typography;

export default function FundPurchases() {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    navigate(`/purchase/${id}`, { state: { id } });
  };

  const columns = [
    {
      title: "Fund Name",
      dataIndex: "fund_name",
      render: (text, record) => (
        <Button type="link" onClick={() => handleNavigate(record._id)} className="p-0">
          {text}
        </Button>
      ),
    },
    {
      title: "Investor Name",
      dataIndex: "investor_name",
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
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
    {
      title: "Payment Method",
      dataIndex: "payment_method",
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
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
    // {
    //   title: "Actions",
    //   actions: [
    //     {
    //       type: "view",
    //       label: "View",
    //       onClick: (record) => handleNavigate(record._id),
    //     },
    //   ],
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
          url: "/admin/get-purchase-list",
          method: "post",
          totalAccessorKey: "totalRecords",
        }}
      />
    </div>
  );
}
