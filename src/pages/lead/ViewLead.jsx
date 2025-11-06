import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useTopData } from "../../components/layout/AppLayout";
import { Form } from "antd";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules, investorKycStatus } from "../../utils/constants";
import errorAnim from "../../assets/error-animation.lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Title from "antd/es/typography/Title";
import { FormField } from "../../components/form/Field";
import CustomButton from "../../components/form/CustomButton";

export default function ViewLead() {
  const { callApi } = useApi();
  const [lead, setLead] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { setTitle } = useTopData();

  const { modal, showCustom, closeModal } = useThemedModal();

  const [form] = Form.useForm();

  const handleStatusChange = async (newStatus, comment) => {
    if (!newStatus) return;

    try {
      const { status } = await callApi({
        url: `/admin/update-status`,
        method: "post",
        data: { user_id: id, kyc_status: newStatus, rejected_comment: comment },
        successOptions: {
          onOk: () => {
            navigate("/leads");
          },
        },
        errorOptions: {},
      });

      if (status) {
        closeModal();
      }
    } catch (error) {}
  };

  const handleShowRejectModal = () => {
    showCustom({
      content: (
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleStatusChange(investorKycStatus.rejected, values.comment);
            form.resetFields();
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact src={errorAnim} loop autoplay />
            <Title level={3} className="text-danger text-center mt-5">
              Reject KYC Verification
            </Title>
            {/* <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}cu
            </Paragraph> */}
          </div>

          <FormField
            name="comment"
            label="Comments"
            type="comment"
            placeholder="Enter your comment"
            rules={formRules.required("Comments")}
            formItemProps={{ className: "mb-3" }}
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <CustomButton btnType="secondary-danger" onClick={closeModal} text="Cancel" />

            <CustomButton htmlType="submit" btnType="danger">
              Reject
            </CustomButton>
          </div>
        </Form>
      ),
    });
  };

  const fetchLead = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/investor-list`,
      data: {
        user_id: id,
      },
      errorOptions: {
        onOk: () => navigate("/leads"),
      },
    });

    const localLead = response.data;

    const updatedLead = {
      ...localLead,
      dob: dayjs(localLead.dob),
    };
    setLead(updatedLead);
    setTitle(`Lead Details - ${updatedLead.full_name}`);
  };

  useEffect(() => {
    if (id) {
      fetchLead();
    }
  }, [id]);

  const formConfig = [
    {
      name: "full_name",
      label: "Full Name",
      type: "input",
    },
    { name: "email", label: "Email Address", type: "input" },
    { name: "phone", label: "Phone Number", type: "input" },

    {
      name: "dob",
      label: "Date of Birth",
      type: "date",
    },
    {
      name: "nationality",
      label: "Nationality",
      type: "input",
    },
    {
      name: "residential_address",
      label: "Residential Address",
      type: "input",
    },
    {
      name: "country",
      label: "Country of residence",
      type: "input",
    },
    {
      name: "postal_code",
      label: "Postal Code",
      type: "input",
    },
    {
      name: "address_file",
      label: "Proof of Address",
      type: "file",
      placeholder: "Upload proof of address (e.g., utility bill)",
    },
    {
      name: "document_file",
      label: "Identity Document",
      type: "file",
      placeholder: "Upload identity proof (e.g., Valid Passport, ID card, passport)",
    },
    {
      name: "signature_file",
      label: "Signature",
      type: "file",
      placeholder: "Accepted Formats: JPEG, PNG, PDF (Max 5MB)",
    },
  ];

  return (
    <>
      <FormBuilder
        mode="view-only"
        formProps={{ autoComplete: "off" }}
        formConfig={formConfig}
        initialValues={lead}
        cancelText="Reject Lead"
        submitText="Approve Lead"
        onCancel={handleShowRejectModal}
        onFinish={() => handleStatusChange(investorKycStatus.approved)}
      />
      {modal}
    </>
  );
}
