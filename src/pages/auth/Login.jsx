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
        url: "/login",
        method: "POST",
        data: {
          email: values.email,
          password: values.password,
        },
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary bg-center bg-no-repeat bg-contain">
      <AuthCard
        title="Complete Your SME Verification"
        description="Seamlessly manage your business orders, buyers, and onboarding — all in one place."
      />

      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={3}>Log in to your account</Title>
        </div>

        <Form
          form={form}
          name="login-form"
          layout="vertical"
          onFinish={handleLogin}
          validateTrigger="onBlur"
        >
          <FormField
            name="email"
            label="Email"
            type="input"
            placeholder="Enter your email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Invalid email address" },
            ]}
            props={{
              suffix: <PiEnvelope style={{ color: "rgba(0,0,0,.45)" }} size={20} />,
            }}
          />

          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            formItemProps={{ className: "mb-0" }}
          />

          <div className="flex items-center justify-between my-3">
            <FormField
              name="remember"
              type="checkbox"
              valuePropName={"checked"}
              rules={[{ required: true }]}
              props={{ children: "Remember me" }}
            />

            <Link to="/forgot-password" className="text-primary">
              Forgot password?
            </Link>
          </div>

          <Form.Item>
            <div className="w-full flex items-center justify-evenly">
              <CustomButton
                loading={loading}
                text={loading ? "Logging in..." : "Login"}
                type="submit"
                htmlType="submit"
              />
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
