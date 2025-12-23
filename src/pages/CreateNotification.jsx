import { useState, useEffect } from "react";
import FormBuilder from "../components/form/FormBuilder";
import { useLocation, useNavigate } from "react-router-dom";
import useApi from "../logic/useApi";
import { formRules } from "../utils/constants";

export default function CreateNotification() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { state } = useLocation();
  const [funds, setFunds] = useState([]);
  const [purchaseMap, setPurchaseMap] = useState({});
  const [investors, setInvestors] = useState([]);

  const onFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (!values[key]) return;
      // Upload files
      if (["notification_picture"].includes(key) && values[key][0].originFileObj)
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
      label: "Type",
      type: "select",
      options: [
        { value: "common", label: "Common" },
        { value: "user", label: "User" },
        { value: "fund", label: "Fund" },
      ],
      rules: formRules.required("Type"),
    },
    {
      name: "fund_id",
      label: "Fund",
      type: "select",
      options: funds.map((fund) => ({ value: fund._id, label: fund.title })),
      placeholder: "Select fund",
      shouldShow: (values) => values.type === "fund",
    },
    {
      name: "send_id",
      label: "User",
      type: "select",
      selectProps: {
        mode: "multiple",
      },
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: "Select user",
      shouldShow: (values) => values.type === "user",
    },
    {
      name: "title",
      label: "Title",
      rules: formRules.required("Title"),
    },
    {
      name: "url",
      label: "URL",
      rules: formRules.url(false),
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
    },
    {
      name: "notification_picture",
      label: "Notification Picture",
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
        { purchaseMap: {}, funds: [], fundIdSet: new Set() }
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
      cancelText="Back"
      submitText="Save"
      onFinish={onFinish}
      loading={loading}
      initialValues={state}
    />
  );
}
