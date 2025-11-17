import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { formRules } from "../../utils/constants";

export default function ViewInvestor() {
  const { callApi, loading } = useApi();
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
        onOk: () => navigate(-1),
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

  const onFinish = async (values) => {
    // Only create when no id
    if (id) return;
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      // Ignore fields
      if (["confirmPassword"].includes(key)) return;

      // Upload files
      if (["address_file", "document_file", "signature_file"].includes(key))
        return formData.append(key, values[key][0].originFileObj);

      formData.append(key, values[key]);
    });

    formData.append("role", "Investor");

    const { status } = await callApi({
      method: "post",
      url: "/admin/add-new",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });
    if (status) {
      navigate("/investors");
    }
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
      rules: formRules.required("Full Name"),
    },
    {
      name: "email",
      label: "Email Address",
      type: "input",
      rules: formRules.email(),
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "input",
      rules: formRules.phone(),
    },

    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
      rules: formRules.required("Date of Birth"),
      datePickerProps: {
        disabledDate: (current) => current && current >= dayjs().startOf("day"),
      },
    },
    {
      name: "nationality",
      label: "Nationality",
      type: "input",
      rules: formRules.required("Nationality"),
    },
    {
      name: "residential_address",
      label: "Residential Address",
      type: "input",
      rules: formRules.required("Address"),
    },
    {
      name: "country",
      label: "Country of residence",
      type: "input",
      rules: formRules.required("Country of residence"),
    },
    {
      name: "postal_code",
      label: "Postal Code",
      type: "input",
      rules: formRules.postalCode(),
    },
    ...(!id
      ? [
          {
            name: "password",
            label: "Create Password",
            type: "password",
            rules: formRules.password(),
          },
          {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            rules: formRules.confirmPass(),
          },
        ]
      : []),
    // files
    {
      name: "address_file",
      label: "Proof of Address",
      type: "file",
      rules: formRules.required("Proof of Address"),
      placeholder: "Upload proof of address (e.g., utility bill)",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "document_file",
      label: "Identity Document",
      type: "file",
      rules: formRules.required("Identity Document"),
      placeholder: "Upload identity proof (e.g., Valid Passport, ID card, passport)",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "signature_file",
      label: "Signature",
      type: "file",
      rules: formRules.required("Signature"),
      placeholder: "Accepted Formats: JPEG, PNG, PDF (Max 5MB)",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
  ];

  return (
    <FormBuilder
      mode={id ? "view-only" : "full"}
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={investor}
      cancelText="Back"
      submitText={id ? undefined : "Save"}
      onFinish={onFinish}
      loading={loading}
    />
  );
}
