import { Typography, Button, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../components/table/CustomTable";
import CustomButton from "../components/form/CustomButton";
import { formatDate } from "../utils/utils";
import dayjs from "dayjs";
import { sampleColumns, sampleData } from "../components/table/sampleData";
import Paragraph from "antd/es/typography/Paragraph";
import TableTitle from "../components/table/TableTitle";
import CustomBadge from "../components/common/CustomBadge";

const { Title } = Typography;

export default function Investors() {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    navigate(`/investors/${id}`, { state: { id } });
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "full_name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (text) => `${text}`,
    },
    {
      title: "KYC Status",
      dataIndex: "kyc_status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant;
        switch (text) {
          case "verified":
            finalText = "KYC Verified";
            finalVariant = "success";
            break;
          case "pending":
            finalText = "Pending Approval";
            finalVariant = "warning";
            break;
          case "rejected":
            finalText = "Denied";
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomBadge variant={finalVariant} label={finalText} />;
      },
    },
    {
      title: "Nationality",
      dataIndex: "nationality",
    },
    {
      title: "Country of Residence",
      dataIndex: "country",
    },
    {
      title: "Actions",
      actions: [
        {
          type: "view",
          label: "View",
          onClick: (record) => handleNavigate(record._id),
        },
      ],
    },
  ];

  return (
    <div>
      <TableTitle
        title="Customers investing"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text="Add New Customer"
            showIcon
            onClick={() => navigate("/investors/create")}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/investor-list",
          method: "post",
        }}
      />
    </div>
  );
}
