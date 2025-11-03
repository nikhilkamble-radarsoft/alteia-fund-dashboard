import { useState } from "react";
import { Form, Input, Button, message, Typography, Card, Checkbox } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CustomButton from "../../components/form/CustomButton";
import { useDispatch } from "react-redux";
import { setAuth } from "../../redux/authSlice";
import useApi from "../../logic/useApi";
import { useGlobalModal } from "../../logic/ModalProvider";
import { FormField } from "../../components/form/Field";
import AppLogo from "../../components/common/AppLogo";
import AuthCard from "../../components/common/AuthCard";
import FormBuilder from "../../components/form/FormBuilder";

const { Title, Paragraph } = Typography;

const SMERegister = () => {
  const { callApi, loading } = useApi();
  const { showError } = useGlobalModal();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (values) => {
    try {
      const { response, status } = await callApi({
        url: "/login",
        method: "POST",
        data: values,
        successOptions: {},
        errorOptions: {},
      });

      if (status) {
        if (!response.token) {
          showError("Login failed. Please try again.");
          return;
        }
        dispatch(setAuth({ token: response.token, user: response.user }));
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formConfig = [
    {
      name: "email",
      label: "Email",
      type: "input",
      placeholder: "Enter your email",
      rules: [
        { required: true, message: "Please input your email!" },
        { type: "email", message: "Invalid email address" },
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary bg-center bg-no-repeat bg-contain">
      <AuthCard
        title="Complete Your SME Profile"
        description="Your business details and KYC ensure fast, secure order management. Verification is mandatory before sending POs to Buyers."
      />

      <Card className="w-full max-w-[680px]">
        <div className="text-center mb-6">
          <Title level={3}>Create your account</Title>
        </div>

        <FormBuilder formConfig={formConfig} onFinish={handleRegister} />
      </Card>
    </div>
  );
};

export default SMERegister;
