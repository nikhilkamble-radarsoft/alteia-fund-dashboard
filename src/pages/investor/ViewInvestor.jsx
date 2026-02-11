import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { formRules } from "../../utils/constants";
import countryList from "../../utils/country_list.json";
import { useTranslation } from "react-i18next";

export default function ViewInvestor() {
  const { callApi, loading } = useApi();
  const [investor, setInvestor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const { setTitle } = useTopData();
  const { t } = useTranslation("form");

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

    setTitle(t("investor.title_details", { name: updatedInvestor.full_name }));
  };

  const onFinish = async (values) => {
    if (id) return;
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (!values[key]) return;
      if (["confirmPassword"].includes(key)) return;

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

  // 4. Update Form Config with t()
  const formConfig = [
    {
      name: "full_name",
      label: t("investor.full_name"),
      type: "input",
      rules: formRules.required(t("investor.full_name")),
    },
    {
      name: "email",
      label: t("investor.email"),
      type: "input",
      rules: formRules.email(),
    },
    {
      name: "phone",
      label: t("investor.phone"),
      type: "input",
      rules: formRules.phone(),
    },

    {
      name: "dob",
      label: t("investor.dob"),
      type: "date",
      rules: formRules.required(t("investor.dob")),
      datePickerProps: {
        disabledDate: (current) => current && current >= dayjs().startOf("day"),
      },
    },
    {
      name: "nationality",
      label: t("investor.nationality"),
      type: "select",
      options: countryList.map((country) => ({
        label: country.nationality_display,
        value: country.nationality,
      })),
      rules: formRules.required(t("investor.nationality")),
    },
    {
      name: "residential_address",
      label: t("investor.address"),
      type: "input",
      rules: formRules.required(t("investor.address")),
    },
    {
      name: "country",
      label: t("investor.country"),
      type: "select",
      options: countryList.map((country) => ({
        label: country.country_of_residence_display,
        value: country.country_of_residence,
      })),
      rules: formRules.required(t("investor.country")),
    },
    {
      name: "postal_code",
      label: t("investor.postal_code"),
      type: "input",
    },
    ...(!id
      ? [
          {
            name: "password",
            label: t("investor.password"),
            type: "password",
            rules: formRules.password(),
          },
          {
            name: "confirmPassword",
            label: t("investor.confirm_password"),
            type: "password",
            rules: formRules.confirmPass(),
          },
        ]
      : []),
    // files
    {
      name: "address_file",
      label: t("investor.proof_address"),
      type: "file",
      rules: formRules.required(t("investor.proof_address")),
      placeholder: t("investor.proof_address_ph"),
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "document_file",
      label: t("investor.identity_doc"),
      type: "file",
      rules: formRules.required(t("investor.identity_doc")),
      placeholder: t("investor.identity_doc_ph"),
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "signature_file",
      label: t("investor.signature"),
      type: "file",
      rules: formRules.required(t("investor.signature")),
      placeholder: t("investor.signature_ph"),
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
  ];

  return (
    <FormBuilder
      mode={id ? "view-only" : "full"}
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={investor}
      cancelText={t("common.back")}
      submitText={id ? undefined : t("common.save")}
      onFinish={onFinish}
      loading={loading}
    />
  );
}
