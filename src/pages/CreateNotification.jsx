import { useState, useEffect } from "react";
import FormBuilder from "../components/form/FormBuilder";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../logic/useApi";
import { formRules } from "../utils/constants";
import { useTranslation } from "react-i18next";

export default function CreateNotification() {
  const { t } = useTranslation("form");
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { state } = useLocation();
  const [funds, setFunds] = useState([]);
  const [purchaseMap, setPurchaseMap] = useState({});
  const [investors, setInvestors] = useState([]);

  const onFinish = async (formValues) => {
    const values = {
      en: { ...state?.en, ...formValues.en },
      ar: { ...state?.ar, ...formValues.ar },
    };

    if (values.en?.type === "fund" && values.en?.fund_id) {
      const users = purchaseMap[values.en.fund_id] || [];
      values.en.send_id = users;
    }

    const formData = new FormData();

    const appendSection = (sectionData, prefix) => {
      if (!sectionData) return;

      Object.keys(sectionData).forEach((key) => {
        const value = sectionData[key];

        if (value === undefined || value === null || value === "") return;

        if (key === "notification_picture") {
          if (Array.isArray(value) && value[0]?.originFileObj) {
            formData.append(key, value[0].originFileObj);
          }
          return;
        }

        if (Array.isArray(value)) {
          formData.append(`${prefix}[${key}]`, JSON.stringify(value));
          return;
        }

        formData.append(`${prefix}[${key}]`, value);
      });
    };

    appendSection(values.en, "en");
    appendSection(values.ar, "ar");

    const { status } = await callApi({
      method: "post",
      url: "/admin/notification/send",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });

    if (status) {
      navigate(-1);
    }
  };

  const formConfig = [
    {
      name: "type",
      label: t("notification.type"),
      type: "select",
      options: [
        { value: "common", label: t("notification.type_common") },
        { value: "user", label: t("notification.type_user") },
        { value: "fund", label: t("notification.type_fund") },
      ],
      rules: formRules.required(t("notification.type")),
    },
    {
      name: "fund_id",
      label: t("purchase.fund"),
      type: "select",
      options: funds.map((fund) => ({ value: fund._id, label: fund.title })),
      placeholder: t("purchase.selectFund"),
      shouldShow: (values) => values.en?.type === "fund",
    },
    {
      name: "send_id",
      label: t("notification.user"),
      type: "select",
      selectProps: {
        mode: "multiple",
      },
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: t("notification.selectUser"),
      shouldShow: (values) => values.en?.type === "user",
    },
    {
      name: "title",
      label: t("notification.title"),
      rules: formRules.required(t("notification.title")),
      type: "input",
    },
    {
      name: "url",
      label: t("field.url"),
      rules: formRules.url(false),
      hideFromOtherLanguages: true,
    },
    {
      name: "message",
      label: t("notification.message"),
      type: "textarea",
    },
    {
      name: "notification_picture",
      label: t("notification.picture"),
      type: "file",
      uploadProps: {
        accept: ["image/jpeg", "image/png", "image/jpg"],
      },
    },
  ];

  const fetchFunds = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/purchase/list",
      });

      const purchases = response?.data ?? [];

      const { purchaseMap: tempPurchaseMap, funds: uniqueFunds } = purchases.reduce(
        (acc, purchase) => {
          const fundId = purchase.fund._id;

          if (!acc.purchaseMap[fundId]) {
            acc.purchaseMap[fundId] = [];
          }
          acc.purchaseMap[fundId].push(purchase.user.user_id);

          if (!acc.fundIdSet.has(fundId)) {
            acc.fundIdSet.add(fundId);
            acc.funds.push(purchase.fund);
          }

          return acc;
        },
        { purchaseMap: {}, funds: [], fundIdSet: new Set() },
      );

      setFunds(uniqueFunds);
      setPurchaseMap(tempPurchaseMap);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  const fetchInvestors = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/investor-list",
        method: "post",
        data: {},
      });
      setInvestors(response.data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
    }
  };

  useEffect(() => {
    fetchFunds();
    fetchInvestors();
  }, []);

  return (
    <FormBuilder
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      cancelText={t("common.back")}
      submitText={t("common.save")}
      onFinish={onFinish}
      loading={loading}
      initialValues={state}
    />
  );
}
