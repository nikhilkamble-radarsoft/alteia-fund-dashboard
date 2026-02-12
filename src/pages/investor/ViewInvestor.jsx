import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { formRules } from "../../utils/constants";
import countryList from "../../utils/country_list.json";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../logic/useLanguage";

export default function ViewInvestor() {
  const { callApi, loading } = useApi();
  const [investor, setInvestor] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const { setTitle } = useTopData();
  const { t } = useTranslation("form");
  const { currentLang } = useLanguage();

  const fetchInvestor = async () => {
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

    // Transform API response to FormBuilder structure: { en: {...}, ar: {...} }
    const formattedInvestor = {
      en: {
        ...data, // Spread common fields (email, phone, ids, etc.) into 'en'

        // Overwrite Multilingual Fields with just the English string
        full_name: data.full_name?.en,
        nationality: data.nationality?.en,
        country: data.country?.en,
        residential_address: data.residential_address?.en,
        risk_appetite: data.risk_appetite?.en,
        investment_interest: data.investment_interest?.en,
        rejected_comment: data.rejected_comment?.en,

        // Format Special Fields
        dob: data.dob ? dayjs(data.dob) : null,
        document_file: data.document_file,
        address_file: data.address_file,
        signature_file: data.signature_file,
      },
      ar: {
        // Map Arabic specific fields
        full_name: data.full_name?.ar || data.full_name?.en,
        nationality: data.nationality?.ar || data.nationality?.en,
        country: data.country?.ar || data.country?.en,
        residential_address: data.residential_address?.ar || data.residential_address?.en,
        risk_appetite: data.risk_appetite?.ar || data.risk_appetite?.en,
        investment_interest: data.investment_interest?.ar || data.investment_interest?.en,
        rejected_comment: data.rejected_comment?.ar || data.rejected_comment?.en,
      },
    };

    setInvestor(formattedInvestor);
  };

  const onFinish = async (values) => {
    if (id) return;

    const formData = new FormData();

    const appendSection = (data, prefix) => {
      if (!data) return;

      Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value === undefined || value === null || value === "") return;
        if (key === "confirmPassword") return;

        if (
          ["address_file", "document_file", "signature_file"].includes(key) &&
          Array.isArray(value) &&
          value[0]?.originFileObj
        ) {
          formData.append(key, value[0].originFileObj);
          return;
        }

        formData.append(`${prefix}[${key}]`, value);
      });
    };

    appendSection(values.en, "en");

    appendSection(values.ar, "ar");

    formData.append("en[role]", "Investor");

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

  useEffect(() => {
    if (investor) {
      setTitle(
        t("investor.title_details", {
          name: investor?.full_name?.[currentLang] || investor?.full_name?.en,
        }),
      );
    }
  }, [investor, currentLang]);

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
      hideFromOtherLanguages: true,
    },
    {
      name: "phone",
      label: t("investor.phone"),
      type: "input",
      rules: formRules.phone(),
      hideFromOtherLanguages: true,
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
      hideFromOtherLanguages: true,
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
