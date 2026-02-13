import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules, investorKycStatus } from "../../utils/constants";
import { checkUserKycDocument } from "../../utils/utils";
import { useTranslation } from "react-i18next";import countryList from "../../utils/country_list.json";


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
      params: {
        skipDefaultTransform: true,
      },
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });

    const data = response.data;

    const formattedLead = {
      en: {
        ...data,

        full_name: data.full_name?.en,
        nationality: data.nationality?.en,
        country: data.country?.en,
        residential_address: data.residential_address?.en,
        risk_appetite: data.risk_appetite?.en,
        investment_interest: data.investment_interest?.en,
        rejected_comment: data.rejected_comment?.en,

        dob: data.dob ? dayjs(data.dob) : null,
        document_file: data.document_file,
        address_file: data.address_file,
        signature_file: data.signature_file,
      },
      ar: {
        full_name: data.full_name?.ar || data.full_name?.en,
        nationality: data.nationality?.ar || data.nationality?.en,
        country: data.country?.ar || data.country?.en,
        residential_address: data.residential_address?.ar || data.residential_address?.en,
        risk_appetite: data.risk_appetite?.ar || data.risk_appetite?.en,
        investment_interest: data.investment_interest?.ar || data.investment_interest?.en,
        rejected_comment: data.rejected_comment?.ar || data.rejected_comment?.en,
      },
    };

    setLead(formattedLead);
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const formConfig = [
    { name: "full_name", label: t("lead.fullName"), type: "input" },
    { name: "email", label: t("lead.emailAddress"), type: "input", hideFromOtherLanguages: true },
    { name: "phone", label: t("lead.phoneNumber"), type: "input", hideFromOtherLanguages: true },
    { name: "dob", label: t("lead.dob"), type: "date" },
    {
      name: "nationality",
      label: t("lead.nationality"),
      type: "select",
      options: countryList.map((country) => ({
        label: country.nationality_display,
        value: country.nationality,
      })),
      rules: formRules.required(t("investor.nationality")),
    },
    { name: "residential_address", label: t("lead.residentialAddress"), type: "input" },
    {
      name: "country",
      label: t("lead.countryOfResidence"),
      type: "select",
      options: countryList.map((country) => ({
        label: country.country_of_residence_display,
        value: country.country_of_residence,
      })),
      rules: formRules.required(t("investor.country")),
    },
    {
      name: "postal_code",
      label: t("lead.postalCode"),
      type: "input",
      hideFromOtherLanguages: true,
    },
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
