import { Typography, Button, Divider, Form } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import { formatDate } from "../../utils/utils";
import dayjs from "dayjs";
import { sampleColumns, sampleData } from "../../components/table/sampleData";
import Paragraph from "antd/es/typography/Paragraph";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { formRules, investorKycStatus } from "../../utils/constants";
import useApi from "../../logic/useApi";
import { useState } from "react";
import { FormField } from "../../components/form/Field";
import { useThemedModal } from "../../logic/useThemedModal";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import errorAnim from "../../assets/error-animation.lottie";

const { Title } = Typography;

export default function Leads() {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { modal, showCustom, closeModal } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);

  const [form] = Form.useForm();

  const handleStatusChange = async (id, newStatus, comment) => {
    if (!newStatus) return;

    try {
      const { status } = await callApi({
        url: `/admin/update-status`,
        method: "post",
        data: { user_id: id, status: newStatus, rejected_comment: comment },
        successOptions: {},
        errorOptions: {},
      });

      if (status) {
        setFetchRefresh(!fetchRefresh);
        closeModal();
      }
    } catch (error) {}
  };

  const handleNavigate = (id) => {
    navigate(`/leads/${id}`, { state: { id } });
  };

  const handleShowRejectModal = (record) => {
    showCustom({
      content: (
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleStatusChange(record._id, investorKycStatus.rejected, values.comment);
            form.resetFields();
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <DotLottieReact src={errorAnim} loop autoplay />
            <Title level={3} className="text-danger text-center mt-5 mb-0">
              Reject KYC
            </Title>
            {/* <Paragraph className="mb-0 text-[16px] text-center text-[#828282]">
              {subMessage}
            </Paragraph> */}
          </div>

          <FormField
            name="comment"
            label="Comment"
            type="comment"
            placeholder="Enter your comment"
            rules={formRules.required("C", "", "Please enter your comment")}
            formItemProps={{ className: "mb-3" }}
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <CustomButton btnType="secondary" onClick={closeModal} text="Cancel" />

            <CustomButton htmlType="submit" btnType="primary">
              Reject
            </CustomButton>
          </div>
        </Form>
      ),
    });
  };

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "full_name",
      render: (text, record) => (
        <Button type="link" onClick={() => handleNavigate(record._id)} className="p-0">
          {text}
        </Button>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (text) => `${text}`,
    },
    {
      title: "KYC Status",
      dataIndex: "kyc_status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant;
        switch (text) {
          case investorKycStatus.approved:
            finalText = "KYC Verified";
            finalVariant = "success";
            break;
          case investorKycStatus.pending:
            finalText = "Pending Approval";
            finalVariant = "warning";
            break;
          case investorKycStatus.rejected:
            finalText = "Denied";
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomBadge variant={finalVariant} label={finalText} />;
      },
    },
    {
      title: "Nationality",
      dataIndex: "nationality",
    },
    {
      title: "Country of Residence",
      dataIndex: "country",
    },
    {
      title: "Actions",
      actions: [
        {
          type: "update",
          label: "Approve",
          onClick: (record) => handleStatusChange(record._id, investorKycStatus.approved),
        },
        {
          type: "update",
          label: "Reject",
          onClick: (record) => handleShowRejectModal(record),
        },
      ],
    },
  ];

  return (
    <div>
      <TableTitle title="Leads Listing" titleColor="text-black" />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/investor-list",
          method: "post",
          fetchRefresh: fetchRefresh,
        }}
      />
      {modal}
    </div>
  );
}
