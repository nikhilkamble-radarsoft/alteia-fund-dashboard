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

  const onFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (values[key] === null || values[key] === undefined || values[key] === "") return;

      // Upload files
      if (["notification_picture"].includes(key) && values[key]?.[0]?.originFileObj)
        return formData.append(key, values[key][0].originFileObj);

      if (Array.isArray(values[key])) {
        values[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, values[key]);
      }
    });

    if (values.type === "fund") {
      const users = purchaseMap[values.fund_id];
      if (users) {
        users.forEach((user) => formData.append("send_id", user));
      }
    }

    const { status } = await callApi({
      method: "post",
      url: "/admin/notification/send",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });

    if (status) {
      navigate("/");
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
      shouldShow: (values) => values.type === "fund",
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
      shouldShow: (values) => values.type === "user",
    },
    {
      name: "title",
      label: t("notification.title"),
      rules: formRules.required(t("notification.title")),
    },
    {
      name: "url",
      label: t("field.url"), // Reusing existing key
      rules: formRules.url(false),
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
      // mode="view-only"
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
