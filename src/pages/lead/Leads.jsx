import { Typography, Button, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import { formatDate } from "../../utils/utils";
import dayjs from "dayjs";
import { sampleColumns, sampleData } from "../../components/table/sampleData";
import Paragraph from "antd/es/typography/Paragraph";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { investorKycStatus } from "../../utils/constants";
import useApi from "../../logic/useApi";
import { useThemedModal } from "../../logic/useThemedModal";
import { useState } from "react";

const { Title } = Typography;

export default function Leads() {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showCustom } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);

  const handleStatusChange = async (id, newStatus) => {
    console.log("newStatus", newStatus);
    if (!newStatus) return;

    try {
      const { status } = await callApi({
        url: `/admin/update-status`,
        method: "post",
        data: { user_id: id, status: newStatus, rejected_comment: "" },
        successOptions: {
          message: "KYC Verification Successful",
        },
        errorOptions: {},
      });

      if (status) setFetchRefresh(!fetchRefresh);
    } catch (error) {}
  };

  const handleNavigate = (id) => {
    navigate(`/leads/${id}`, { state: { id } });
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "full_name",
      render: (text, record) => (
        <Button type="link" onClick={() => handleNavigate(record._id)} className="p-0">
          {text}
        </Button>
      ),
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
          case investorKycStatus.approved:
            finalText = "KYC Verified";
            finalVariant = "success";
            break;
          case investorKycStatus.pending:
            finalText = "Pending Approval";
            finalVariant = "warning";
            break;
          case investorKycStatus.rejected:
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
          type: "update",
          label: "Approve",
          onClick: (record) => handleStatusChange(record._id, investorKycStatus.approved),
        },
        {
          type: "update",
          label: "Reject",
          onClick: (record) => showCustom({}),
        },
      ],
    },
  ];

  return (
    <div>
      <TableTitle title="Leads Listing" titleColor="text-black" />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/investor-list",
          method: "post",
          fetchRefresh,
        }}
      />
    </div>
  );
}
