import { useState } from "react";
import { Typography, Form, Button, Space, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import FormBuilder from "../components/form/FormBuilder";
import { formRules } from "../utils/constants";
import useApi from "../logic/useApi";

const { Title } = Typography;

export default function CreateInvestor() {
  const navigate = useNavigate();
  const { callApi } = useApi();

  const onFinish = async (values) => {
    console.log("Form values:", values);
    const { response, status } = await callApi({
      method: "post",
      url: "/admin/add-new",
      data: { ...values },
      successOptions: {subMessage: "The new customer profile has been created and is now pending verification. You can review or manage the customer in the dashboard."},
      errorOptions: {},
    });
    // navigate("/investors");
  };

  const formConfig = [
    {
      name: "full_name",
      label: "Full Name",
      type: "input",
      rules: formRules.required("Full Name"),
    },
    { name: "email", label: "Email Address", type: "input", rules: formRules.email() },
    { name: "phone", label: "Phone Number", type: "input", rules: formRules.phone() },
    {
      name: "residential_address",
      label: "Address",
      type: "input",
      rules: formRules.required("Address"),
    },
    {
      name: "nationality",
      label: "Nationality",
      type: "input",
      rules: formRules.required("Nationality"),
    },
    {
      name: "country",
      label: "Country of residence",
      type: "input",
      rules: formRules.required("Country of residence"),
    },
    {
      name: "proofOfAddr",
      label: "Proof of Address",
      type: "file",
      rules: formRules.required("Proof of Address"),
      placeholder: "Upload proof of address (e.g., utility bill)",
    },
    {
      name: "identityProof",
      label: "Identity Document",
      type: "file",
      rules: formRules.required("Identity Document"),
      placeholder: "Upload identity proof (e.g., Valid Passport, ID card, passport)",
    },
    {
      name: "investment_status",
      label: "Investment Status",
      type: "select",
      options: [
        { label: "New Lead", value: "new" },
        { label: "Approved", value: "approved" },
      ],
      placeholder: "Select initial investment status",
      rules: formRules.required("Investment Status"),
    },
  ];

  return <FormBuilder formConfig={formConfig} onFinish={onFinish} />;
}
