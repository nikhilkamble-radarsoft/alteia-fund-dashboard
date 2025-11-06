import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";

export default function ViewTrade() {
  const { callApi } = useApi();
  const [investor, setInvestor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const { setTitle } = useTopData();

  const fetchInvestor = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/investor-list`,
      data: {
        user_id: id,
      },
      errorOptions: {
        onOk: () => navigate("/investors"),
      },
    });

    const localInvestor = response.data;

    const updatedInvestor = {
      ...localInvestor,
      dob: dayjs(localInvestor.dob),
    };
    setInvestor(updatedInvestor);
    setTitle(`Investor Details - ${updatedInvestor.full_name}`);
  };

  useEffect(() => {
    if (id) {
      fetchInvestor();
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
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "document_file",
      label: "Identity Document",
      type: "file",
      placeholder: "Upload identity proof (e.g., Valid Passport, ID card, passport)",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "signature_file",
      label: "Signature",
      type: "file",
      placeholder: "Accepted Formats: JPEG, PNG, PDF (Max 5MB)",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
  ];

  return (
    <FormBuilder
      mode="view-only"
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={investor}
      cancelText="Back"
    />
  );
}
