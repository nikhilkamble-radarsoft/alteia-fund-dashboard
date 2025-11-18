import { Button, Divider, Form } from "antd";
import { useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { formRules, investorKycStatus } from "../../utils/constants";
import useApi from "../../logic/useApi";
import { useState } from "react";
import { useThemedModal } from "../../logic/useThemedModal";
import { checkUserKycDocument } from "../../utils/utils";

export default function Leads() {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { modal, showConfirm, closeModal } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);

  const [form] = Form.useForm();

  const handleStatusChange = async (id, newStatus, comment) => {
    if (!newStatus) return;

    try {
      const { status } = await callApi({
        url: `/admin/update-status`,
        method: "post",
        data: { user_id: id, kyc_status: newStatus, rejected_comment: comment },
        successOptions: {},
        errorOptions: {},
      });

      if (status) {
        setFetchRefresh(!fetchRefresh);
        closeModal();
      }
    } catch (error) {}
  };

  const handleNavigate = (id) => {
    navigate(`/leads/${id}`, { state: { id } });
  };

  const handleShowRejectModal = (record) => {
    showConfirm({
      title: "",
      message: "Reject KYC Verification",
      variant: "error",
      confirmText: "Reject",
      cancelText: "Cancel",
      fields: [
        {
          name: "comment",
          label: "Comments",
          type: "textarea",
          placeholder: "Enter your comment",
          rules: formRules.required("Comments"),
          rows: 4,
        },
      ],
      onConfirm: (values) => {
        handleStatusChange(record._id, investorKycStatus.rejected, values.comment);
      },
    });
  };

  const handleShowApproveModal = (record) => {
    showConfirm({
      title: "",
      message: "Approve KYC Verification",
      variant: "success",
      confirmText: "Approve",
      cancelText: "Cancel",
      onConfirm: () => {
        handleStatusChange(record._id, investorKycStatus.approved);
      },
    });
  };

  const handleKycNavigate = (record) => {
    navigate(`/create-notification`, { state: { user_id: record._id, type: "user" } });
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
    { title: "Email", dataIndex: "email" },
    {
      title: "Phone",
      dataIndex: "phone",
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
    { title: "Nationality", dataIndex: "nationality" },
    { title: "Country of Residence", dataIndex: "country" },
    {
      title: "Actions",
      actions: (record) => [
        {
          type: "update",
          label: "Approve",
          onClick: (record) => handleShowApproveModal(record),
          visible: record.kyc_status === investorKycStatus.pending && record.hasKycDocument,
        },
        {
          type: "update",
          label: "Reject",
          onClick: (record) => handleShowRejectModal(record),
          visible: record.kyc_status === investorKycStatus.pending && record.hasKycDocument,
        },
        {
          type: "update",
          label: "Request KYC",
          onClick: (record) => handleKycNavigate(record),
          visible: !record.hasKycDocument,
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
          fetchRefresh: fetchRefresh,
          data: {
            kyc_status: ["pending", "rejected"],
          },
          dataMapper: (data) =>
            data.map((item) => ({ ...item, hasKycDocument: checkUserKycDocument(item) })),
        }}
      />
      {modal}
    </div>
  );
}
