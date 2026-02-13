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
import countryList from "../../utils/country_list.json";
import { useTranslation } from "react-i18next";

export default function Leads() {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { modal, showConfirm } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);
  const { t } = useTranslation("table");

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
      }

      return status;
    } catch (error) {}
  };

  const handleNavigate = (id) => {
    navigate(`/leads/${id}`, { state: { id } });
  };

  const handleShowRejectModal = (record) => {
    showConfirm({
      title: "",
      message: t("leads.modals.reject_title"),
      variant: "error",
      confirmText: t("leads.modals.reject_btn"),
      cancelText: t("leads.modals.cancel_btn"),
      multiLanguage: true,
      fields: [
        {
          name: "comment",
          label: t("leads.modals.comment_label"),
          type: "textarea",
          placeholder: t("leads.modals.comment_placeholder"),
          rules: formRules.required(t("leads.modals.comment_label")),
          rows: 4,
        },
      ],
      onConfirm: (values) => {
        const commentPayload = {
          en: values.en?.comment,
          ar: values.ar?.comment,
        };
        return handleStatusChange(record._id, investorKycStatus.rejected, commentPayload);
      },
    });
  };

  const handleShowApproveModal = (record) => {
    showConfirm({
      title: "",
      message: t("leads.modals.approve_title"),
      variant: "success",
      confirmText: t("leads.modals.approve_btn"),
      cancelText: t("leads.modals.cancel_btn"),
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
      title: t("leads.columns.customer_name"),
      dataIndex: "full_name",
      render: (text, record) => (
        <Button type="link" onClick={() => handleNavigate(record._id)} className="p-0">
          {text}
        </Button>
      ),
    },
    {
      title: t("common.columns.email"),
      dataIndex: "email",
    },
    {
      title: t("common.columns.phone"),
      dataIndex: "phone",
      render: (text, record) => {
        const phoneCode = countryList.find(
          (item) => item.country_of_residence === record.country,
        )?.phone_code;
        return `${phoneCode ? phoneCode + " " : ""}${text}`;
      },
    },
    {
      title: t("investors.columns.kyc_status"),
      dataIndex: "kyc_status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant;
        switch (text) {
          case investorKycStatus.approved:
            finalText = t("investors.kyc_status.verified");
            finalVariant = "success";
            break;
          case investorKycStatus.pending:
            finalText = t("investors.kyc_status.pending");
            finalVariant = "warning";
            break;
          case investorKycStatus.rejected:
            finalText = t("investors.kyc_status.denied");
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomBadge variant={finalVariant} label={finalText} />;
      },
    },
    {
      title: t("leads.columns.nationality"),
      dataIndex: "nationality",
    },
    {
      title: t("leads.columns.country"),
      dataIndex: "country",
    },
    {
      title: t("common.columns.actions"),
      actions: (record) => [
        {
          type: "update",
          label: t("leads.actions.approve"),
          onClick: (record) => handleShowApproveModal(record),
          visible: record.kyc_status === investorKycStatus.pending && record.hasKycDocument,
        },
        {
          type: "update",
          label: t("leads.actions.reject"),
          onClick: (record) => handleShowRejectModal(record),
          visible: record.kyc_status === investorKycStatus.pending && record.hasKycDocument,
        },
        {
          type: "update",
          label: t("leads.actions.request_kyc"),
          onClick: (record) => handleKycNavigate(record),
          visible: !record.hasKycDocument,
        },
      ],
    },
  ];

  return (
    <div>
      <TableTitle title={t("leads.title")} titleColor="text-black" />
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
