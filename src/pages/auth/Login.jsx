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
import { EyeOutlined, UserOutlined } from "@ant-design/icons";
import { PiEnvelope } from "react-icons/pi";
import { formRules } from "../../utils/constants";

const { Title, Paragraph } = Typography;

const Login = () => {
  const { callApi, loading } = useApi();
  const { showError } = useGlobalModal();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values) => {
    try {
      // const { data } = await axios.post("/login", {
      //   email: values.email,
      //   password: values.password,
      // });

      const { response, status } = await callApi({
        url: "/admin/login",
        method: "POST",
        data: values,
        successOptions: {
          subMessage:
            "The new customer profile has been created and is now pending verification. You can review or manage the customer in the dashboard.",
        },
        errorOptions: {},
      });

      if (status) {
        if (!response.token) {
          showError("Login failed. Please try again.");
          return;
        }
        dispatch(setAuth({ token: response.token, user: response.data }));
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between pt-12 min-h-screen bg-primary bg-center bg-no-repeat bg-contain">
      <AuthCard />

      <Card className="w-full max-w-xl flex flex-col items-center p-14 rounded-t-3xl rounded-b-none">
        <div className="text-center mb-6">
          <Title level={3} className="mb-0 font-bold">
            Log in to your account
          </Title>
          <paragraph className="text-[#828282]">Sign in to manage trades, users, and ROI</paragraph>
        </div>

        <Form
          form={form}
          name="login-form"
          layout="vertical"
          onFinish={handleLogin}
          validateTrigger="onBlur"
          className="w-82"
        >
          <FormField
            name="email"
            label="Email Address"
            type="input"
            placeholder="Enter your email"
            rules={formRules.email(true, "Please enter your email address")}
            props={{
              suffix: <PiEnvelope style={{ color: "rgba(0,0,0,.45)" }} size={20} />,
            }}
          />

          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            rules={formRules.required("password", "", "Please enter your password")}
            formItemProps={{ className: "mb-0" }}
          />

          {/* <div className="flex items-center justify-between my-3">
            <FormField
              name="remember"
              type="checkbox"
              label={"Remember me"}
            />

            <Link to="/forgot-password" className="text-primary">
              Forgot password?
            </Link>
          </div> */}

          <div className="w-full flex flex-col items-center justify-evenly mt-6">
            <CustomButton
              loading={loading}
              text={loading ? "Signing in..." : "Sign in"}
              type="submit"
              htmlType="submit"
              width=""
              className="!text-[16px]"
              textClasses=""
            />

            <Paragraph className="text-[#828282]">
              Need help? <strong>Contact system administrator.</strong>
            </Paragraph>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
