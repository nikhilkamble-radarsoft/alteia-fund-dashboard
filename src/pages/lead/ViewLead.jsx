import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules, investorKycStatus } from "../../utils/constants";
import { checkUserKycDocument } from "../../utils/utils";
import { useTranslation } from "react-i18next";

export default function ViewLead() {
  const { t } = useTranslation("form");
  const { callApi, loading } = useApi();
  const [lead, setLead] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle } = useTopData();

  const { modal, showConfirm, closeModal } = useThemedModal();

  const handleStatusChange = async (newStatus, comment) => {
    if (!newStatus) return;

    try {
      const { status } = await callApi({
        url: `/admin/update-status`,
        method: "post",
        data: { user_id: id, kyc_status: newStatus, rejected_comment: comment },
        successOptions: {
          onOk: () => {
            navigate("/leads");
          },
        },
        errorOptions: {},
      });

      if (status) {
        closeModal();
      }
    } catch (error) {}
  };

  const handleShowRejectModal = () => {
    showConfirm({
      title: "",
      message: t("lead.rejectKYCVerification"),
      variant: "error",
      confirmText: t("lead.reject"),
      cancelText: t("lead.cancel"),
      fields: [
        {
          name: "comment",
          label: t("lead.comments"),
          type: "textarea",
          placeholder: t("lead.enterComment"),
          rules: formRules.required(t("lead.comments")),
          rows: 4,
        },
      ],
      onConfirm: (values) => {
        handleStatusChange(investorKycStatus.rejected, values.comment);
      },
    });
  };

  const handleShowApproveModal = () => {
    showConfirm({
      title: "",
      message: t("lead.approveKYCVerification"),
      variant: "success",
      confirmText: t("lead.approve"),
      cancelText: t("lead.cancel"),
      onConfirm: () => {
        handleStatusChange(investorKycStatus.approved);
      },
    });
  };

  const fetchLead = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/investor-list`,
      data: {
        user_id: id,
      },
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });

    const localLead = response.data;

    const updatedLead = {
      ...localLead,
      dob: dayjs(localLead.dob),
    };
    setLead(updatedLead);
    setTitle(t("lead.leadDetails", { name: updatedLead.full_name }));
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const formConfig = [
    { name: "full_name", label: t("lead.fullName"), type: "input" },
    { name: "email", label: t("lead.emailAddress"), type: "input" },
    { name: "phone", label: t("lead.phoneNumber"), type: "input" },
    { name: "dob", label: t("lead.dob"), type: "date" },
    { name: "nationality", label: t("lead.nationality"), type: "input" },
    { name: "residential_address", label: t("lead.residentialAddress"), type: "input" },
    { name: "country", label: t("lead.countryOfResidence"), type: "input" },
    { name: "postal_code", label: t("lead.postalCode"), type: "input" },
    {
      name: "address_file",
      label: t("lead.proofOfAddress"),
      type: "file",
      placeholder: t("lead.uploadProofOfAddress"),
    },
    {
      name: "document_file",
      label: t("lead.identityDocument"),
      type: "file",
      placeholder: t("lead.uploadIdentityProof"),
    },
    {
      name: "signature_file",
      label: t("lead.signature"),
      type: "file",
      placeholder: t("lead.acceptedFormats"),
    },
  ];

  return (
    <>
      <FormBuilder
        mode="view-only"
        formProps={{ autoComplete: "off" }}
        formConfig={formConfig}
        initialValues={lead}
        loading={loading}
        {...(lead?.kyc_status === investorKycStatus.pending && checkUserKycDocument(lead)
          ? {
              cancelText: t("lead.rejectLead"),
              submitText: t("lead.approveLead"),
              onCancel: handleShowRejectModal,
              onFinish: handleShowApproveModal,
            }
          : { cancelText: t("lead.back") })}
      />
      {modal}
    </>
  );
}
