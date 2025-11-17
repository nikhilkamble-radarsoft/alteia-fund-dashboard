import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules, investorKycStatus } from "../../utils/constants";

export default function ViewLead() {
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
        handleStatusChange(investorKycStatus.rejected, values.comment);
      },
    });
  };

  const handleShowApproveModal = () => {
    showConfirm({
      title: "",
      message: "Approve KYC Verification",
      variant: "success",
      confirmText: "Approve",
      cancelText: "Cancel",
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
    setTitle(`Lead Details - ${updatedLead.full_name}`);
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const formConfig = [
    {
      name: "full_name",
      label: "Full Name",
      type: "input",
    },
    { name: "email", label: "Email Address", type: "input" },
    { name: "phone", label: "Phone Number", type: "input" },

    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
    },
    {
      name: "nationality",
      label: "Nationality",
      type: "input",
    },
    {
      name: "residential_address",
      label: "Residential Address",
      type: "input",
    },
    {
      name: "country",
      label: "Country of residence",
      type: "input",
    },
    {
      name: "postal_code",
      label: "Postal Code",
      type: "input",
    },
    {
      name: "address_file",
      label: "Proof of Address",
      type: "file",
      placeholder: "Upload proof of address (e.g., utility bill)",
    },
    {
      name: "document_file",
      label: "Identity Document",
      type: "file",
      placeholder: "Upload identity proof (e.g., Valid Passport, ID card, passport)",
    },
    {
      name: "signature_file",
      label: "Signature",
      type: "file",
      placeholder: "Accepted Formats: JPEG, PNG, PDF (Max 5MB)",
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
        {...(lead?.kyc_status === investorKycStatus.pending
          ? {
              cancelText: "Reject Lead",
              submitText: "Approve Lead",
              onCancel: handleShowRejectModal,
              onFinish: handleShowApproveModal,
            }
          : { cancelText: "Back" })}
      />
      {modal}
    </>
  );
}
