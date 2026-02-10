import { Typography, Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomTag from "../../components/common/CustomTag";
import { useThemedModal } from "../../logic/useThemedModal";
import { formRules } from "../../utils/constants";
import useApi from "../../logic/useApi";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function FundCategories() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { showConfirm, modal, closeModal } = useThemedModal();
  const [fetchRefresh, setFetchRefresh] = useState(false);
  const { t } = useTranslation("table");

  const handleDelete = (record) => {
    showConfirm({
      message: t("categories.modals.delete_title"),
      subMessage: t("categories.modals.delete_message"),
      showAnimation: false,
      variant: "error",
      confirmText: t("categories.modals.delete_btn"),
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
      title: t("categories.columns.name"),
      dataIndex: "name",
      render: (text, record) => (
        <NavLink
          onClick={() => {
            showConfirm({
              message: t("categories.modals.edit_title"),
              subMessage: t("categories.modals.subtitle"),
              showAnimation: false,
              twoColumn: false,
              fields: [
                {
                  name: "name",
                  label: t("categories.modals.name_label"),
                  type: "input",
                  rules: formRules.required(t("categories.modals.name_label")),
                },
                {
                  name: "description",
                  label: t("categories.modals.desc_label"),
                  type: "textarea",
                  placeholder: t("categories.modals.desc_placeholder"),
                },
              ],
              onConfirm: async (values) => {
                await callApi({
                  url: `/admin/fund-category/${record._id}`,
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
      title: t("categories.columns.description"),
      dataIndex: "description",
    },
    {
      title: t("common.columns.status"),
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case "active":
            finalText = t("categories.status.active");
            finalVariant = "success";
            break;
          case "inactive":
            finalText = t("categories.status.inactive");
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
    {
      title: t("categories.columns.action"),
      dataIndex: "action",
      actions: (record) => [
        {
          label: t("categories.actions.delete"),
          onClick: (record) => handleDelete(record),
          disabled: record.status === "active",
        },
      ],
    },
  ];

  return (
    <>
      <TableTitle
        title={t("categories.title")}
        titleColor="text-black"
        buttons={[
          <CustomButton
            text={t("categories.add_new")}
            showIcon
            onClick={() => {
              showConfirm({
                message: t("categories.modals.create_title"),
                subMessage: t("categories.modals.subtitle"),
                showAnimation: false,
                twoColumn: false,
                fields: [
                  {
                    name: "name",
                    label: t("categories.modals.name_label"),
                    type: "input",
                    rules: formRules.required(t("categories.modals.name_label")),
                  },
                  {
                    name: "description",
                    label: t("categories.modals.desc_label"),
                    type: "textarea",
                    placeholder: t("categories.modals.desc_placeholder"),
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
