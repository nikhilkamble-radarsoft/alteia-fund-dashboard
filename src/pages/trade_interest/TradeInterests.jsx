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

const { Title } = Typography;

export default function TradeInterests() {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const { showConfirm, modal, closeModal } = useThemedModal();

  const handleRemindMe = (record) => {
    showConfirm({
      message: "Set Follow-Up Reminder",
      showAnimation: false,
      twoColumn: true,
      fields: [
        {
          name: "reminder_date",
          label: "Reminder Date",
          type: "date",
          rules: formRules.required("Reminder Date"),
          datePickerProps: {
            disabledDate: (current) => current && current < dayjs().startOf("day"),
          },
        },
        {
          name: "reminder_time",
          label: "Time",
          type: "time",
          rules: [
            ...formRules.required("Time"),
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                const reminderDate = getFieldValue("reminder_date");

                // If either is missing, let required rules handle it
                if (!value || !reminderDate) {
                  return Promise.resolve();
                }

                // Combine date + time into a single datetime
                const selectedDateTime = dayjs(reminderDate)
                  .hour(dayjs(value).hour())
                  .minute(dayjs(value).minute())
                  .second(0);

                if (selectedDateTime.isBefore(dayjs())) {
                  return Promise.reject(new Error("No past date or time allowed"));
                }

                return Promise.resolve();
              },
            }),
          ],

          timePickerProps: (form) => ({
            disabledTime: () => {
              const selectedDate = form.getFieldValue("reminder_date");

              // If no date or not today → no restrictions
              if (!selectedDate || !dayjs(selectedDate).isSame(dayjs(), "day")) {
                return {};
              }

              const now = dayjs();
              const currentHour = now.hour();
              const currentMinute = now.minute();

              return {
                disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),

                disabledMinutes: (hour) =>
                  hour === currentHour ? Array.from({ length: currentMinute }, (_, i) => i) : [],
              };
            },
          }),
        },

        {
          name: "comment",
          label: "Comments",
          type: "textarea",
          placeholder: "Enter your comment",
          rules: formRules.required("Comments"),
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
            successOptions: {},
            errorOptions: {},
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
      title: "Customer Name",
      dataIndex: "full_name",
      // render: (text, record) => (
      //   <NavLink to={`/investors/${record.user_id}`} className="p-0">
      //     {text}
      //   </NavLink>
      // ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Fund Interest",
      dataIndex: "title",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case tradeInterestStatus.new:
            finalText = "New";
            finalVariant = "upcoming";
            break;
          case tradeInterestStatus.contacted:
            finalText = "Contacted";
            finalVariant = "primary";
            break;
          case tradeInterestStatus.reminder_set:
            finalText = "Reminder Set";
            finalVariant = "pending";
            break;
          case tradeInterestStatus.missed_reminder:
            finalText = "Missed Reminder";
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
    {
      title: "Last activity",
      dataIndex: "last_activity",
    },
    {
      title: "Action",
      dataIndex: "action",
      actions: (record) => [
        {
          label: "Remind me",
          onClick: (record) => handleRemindMe(record),
          visible: ![tradeInterestStatus.reminder_set, tradeInterestStatus.contacted].includes(
            record.status
          ),
        },
        {
          label: "Request KYC",
          onClick: (record) => handleKycNavigate(record),
          visible: investorKycStatus.pending === record.kyc_status,
        },
        {
          label: "Complete Purchase",
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
      <TableTitle title="Funds Interest" titleColor="text-black" subtitleColor="text-black" />
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
