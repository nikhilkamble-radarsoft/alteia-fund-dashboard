import { useState, useEffect } from "react";
import FormBuilder from "../components/form/FormBuilder";
import { useNavigate } from "react-router-dom";
import useApi from "../logic/useApi";
import { formRules } from "../utils/constants";

export default function CreateNotification() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const [funds, setFunds] = useState([]);
  const [investors, setInvestors] = useState([]);

  const onFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      // Upload files
      if (["fund_document", "banner_image"].includes(key) && values[key][0].originFileObj)
        return formData.append(key, values[key][0].originFileObj);

      if (Array.isArray(values[key])) {
        values[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, values[key]);
      }
    });

    const { status } = await callApi({
      method: "post",
      url: "/admin/notification/send",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });

    if (status) {
      navigate("/dashboard");
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
      selectProps: {
        mode: "multiple",
      },
      options: funds.map((fund) => ({ value: fund._id, label: fund.title })),
      placeholder: "Select fund",
      shouldShow: (values) => values.type === "fund",
    },
    {
      name: "user_id",
      label: "Investor",
      type: "select",
      selectProps: {
        mode: "multiple",
      },
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: "Select investor",
      shouldShow: (values) => values.type === "user",
    },
    {
      name: "title",
      label: "Title",
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
      name: "notification_pic",
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
        url: "/admin/get-trade-list",
        method: "post",
        data: {},
      });
      setFunds(response.data || []);
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
    />
  );
}
