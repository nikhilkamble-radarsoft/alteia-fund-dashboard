import { Typography, Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import { investorKycStatus, tradeInterestStatus } from "../../utils/constants";
import CustomTag from "../../components/common/CustomTag";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules } from "../../utils/constants";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { useState } from "react";

const { Title } = Typography;

export default function FundCategories() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { showConfirm, modal, closeModal } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);

  const handleDelete = (record) => {
    showConfirm({
      message: "Delete Category",
      subMessage: "Are you sure you want to delete category?",
      showAnimation: false,
      variant: "error",
      confirmText: "Delete category",
      onConfirm: async (values) => {
        try {
          const { status } = await callApi({
            url: `/admin/fund-category/${record._id}`,
            method: "DELETE",
            successOptions: {
              onOk: () => {
                closeModal();
                setFetchRefresh((prev) => !prev);
              },
            },
            errorOptions: {},
          });
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <NavLink
          onClick={() => {
            showConfirm({
              // variant: "none",
              message: "Edit Fund Category",
              subMessage:
                "Define a category to group similar funds and improve fund discovery and reporting.",
              showAnimation: false,
              twoColumn: false,
              fields: [
                {
                  name: "name",
                  label: "Name",
                  type: "input",
                  rules: formRules.required("Name"),
                },
                {
                  name: "description",
                  label: "Description",
                  type: "textarea",
                  placeholder: "Enter your description",
                },
              ],
              onConfirm: async (values) => {
                await callApi({
                  url: `/admin/fund-category`,
                  method: "PUT",
                  data: { ...values },
                  successOptions: {
                    onOk: () => {
                      closeModal();
                      setFetchRefresh((prev) => !prev);
                    },
                  },
                  errorOptions: {},
                });
              },
              initialValues: {
                name: record.name,
                description: record.description,
              },
            });
          }}
        >
          {text}
        </NavLink>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case "active":
            finalText = "Active";
            finalVariant = "success";
            break;
          case "inactive":
            finalText = "Inactive";
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      actions: (record) => [
        {
          label: "Delete",
          onClick: (record) => handleDelete(record),
          visible: record.status !== "active",
        },
      ],
    },
  ];

  return (
    <>
      <TableTitle
        title="Fund Categories"
        titleColor="text-black"
        buttons={[
          <CustomButton
            text="Add New Category"
            showIcon
            onClick={() => {
              showConfirm({
                // variant: "none",
                message: "Create Fund Category",
                subMessage:
                  "Define a category to group similar funds and improve fund discovery and reporting.",
                showAnimation: false,
                twoColumn: false,
                fields: [
                  {
                    name: "name",
                    label: "Name",
                    type: "input",
                    rules: formRules.required("Name"),
                  },
                  {
                    name: "description",
                    label: "Description",
                    type: "textarea",
                    placeholder: "Enter your description",
                  },
                ],
                onConfirm: async (values) => {
                  await callApi({
                    url: `/admin/fund-category`,
                    method: "POST",
                    data: { ...values },
                    successOptions: {
                      onOk: () => {
                        closeModal();
                        setFetchRefresh((prev) => !prev);
                      },
                    },
                    errorOptions: {},
                  });
                },
              });
            }}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/fund-category",
          fetchRefresh,
        }}
        rowKey="_id"
      />
      {modal}
    </>
  );
}
