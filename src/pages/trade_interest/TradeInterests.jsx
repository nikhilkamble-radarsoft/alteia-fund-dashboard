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
// CHANGED: Import translation hook
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function TradeInterests() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { showConfirm, modal, closeModal } = useThemedModal();
  // CHANGED: Initialize translation hook
  const { t } = useTranslation("table");

  const handleRemindMe = (record) => {
    showConfirm({
      message: t("interests.modal.title"), // CHANGED
      showAnimation: false,
      twoColumn: true,
      fields: [
        {
          name: "reminder_date",
          label: t("interests.modal.reminder_date"), // CHANGED
          type: "date",
          rules: formRules.required(t("interests.modal.reminder_date")), // CHANGED
          datePickerProps: {
            disabledDate: (current) => current && current < dayjs().startOf("day"),
          },
        },
        {
          name: "reminder_time",
          label: t("interests.modal.time"), // CHANGED
          type: "time",
          rules: [
            ...formRules.required(t("interests.modal.time")), // CHANGED
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const reminderDate = getFieldValue("reminder_date");

                if (!value || !reminderDate) {
                  return Promise.resolve();
                }

                const selectedDateTime = dayjs(reminderDate)
                  .hour(dayjs(value).hour())
                  .minute(dayjs(value).minute())
                  .second(0);

                if (selectedDateTime.isBefore(dayjs())) {
                  return Promise.reject(new Error(t("interests.modal.error_past_date"))); // CHANGED
                }

                return Promise.resolve();
              },
            }),
          ],
          timePickerProps: (form) => ({
            disabledTime: () => {
              const selectedDate = form.getFieldValue("reminder_date");
              if (!selectedDate || !dayjs(selectedDate).isSame(dayjs(), "day")) {
                return {};
              }
              const now = dayjs();
              return {
                disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                disabledMinutes: (hour) =>
                  hour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : [],
              };
            },
          }),
        },
        {
          name: "comment",
          label: t("interests.modal.comments"), // CHANGED
          type: "textarea",
          placeholder: t("interests.modal.comments_placeholder"), // CHANGED
          rules: formRules.required(t("interests.modal.comments")), // CHANGED
          rows: 4,
          formItemProps: {
            className: "md:col-span-2",
          },
        },
      ],
      onConfirm: async (values) => {
        try {
          const { status } = await callApi({
            url: `/admin/add-new-followup`,
            method: "POST",
            data: {
              ...values,
              wishlist_id: record.wishlist_id,
            },
          });
          if (status) {
            closeModal();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  const handleKycNavigate = (record) => {
    navigate(`/create-notification`, { state: { user_id: record.user_id, type: "user" } });
  };

  const columns = [
    {
      title: t("interests.columns.customer_name"), // CHANGED
      dataIndex: "full_name",
    },
    {
      title: t("common.columns.email"), // CHANGED (Reusing common key)
      dataIndex: "email",
    },
    {
      title: t("interests.columns.fund_interest"), // CHANGED
      dataIndex: "title",
    },
    {
      title: t("common.columns.status"),
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case tradeInterestStatus.new:
            finalText = t("interests.status.new"); // CHANGED
            finalVariant = "upcoming";
            break;
          case tradeInterestStatus.contacted:
            finalText = t("interests.status.contacted"); // CHANGED
            finalVariant = "primary";
            break;
          case tradeInterestStatus.reminder_set:
            finalText = t("interests.status.reminder_set"); // CHANGED
            finalVariant = "pending";
            break;
          case tradeInterestStatus.missed_reminder:
            finalText = t("interests.status.missed_reminder"); // CHANGED
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
    {
      title: t("interests.columns.last_activity"), // CHANGED
      dataIndex: "last_activity",
    },
    {
      title: t("interests.columns.action"), // CHANGED
      dataIndex: "action",
      actions: (record) => [
        {
          label: t("interests.actions.remind_me"), // CHANGED
          onClick: (record) => handleRemindMe(record),
          visible: ![tradeInterestStatus.reminder_set, tradeInterestStatus.contacted].includes(
            record.status,
          ),
        },
        {
          label: t("interests.actions.request_kyc"), // CHANGED
          onClick: (record) => handleKycNavigate(record),
          visible: investorKycStatus.pending === record.kyc_status,
        },
        {
          label: t("interests.actions.complete_purchase"), // CHANGED
          onClick: (record) =>
            navigate(`/purchase/create`, {
              state: { trade_id: record.fund_id, user_id: record.user_id },
            }),
          visible: investorKycStatus.approved === record.kyc_status,
        },
      ],
    },
  ];

  return (
    <>
      <TableTitle
        title={t("interests.title")} // CHANGED
        titleColor="text-black"
        subtitleColor="text-black"
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/interest-trade",
          totalAccessorKey: "total_funds",
        }}
        rowKey="wishlist_id"
      />
      {modal}
    </>
  );
}
