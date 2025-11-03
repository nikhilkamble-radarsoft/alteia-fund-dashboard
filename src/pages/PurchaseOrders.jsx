import { Typography, Button, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../components/table/CustomTable";
import CustomButton from "../components/form/CustomButton";
import { formatDate } from "../utils/utils";
import dayjs from "dayjs";
import { sampleColumns, sampleData } from "../components/table/sampleData";
import Paragraph from "antd/es/typography/Paragraph";
import TableTitle from "../components/table/TableTitle";

const { Title } = Typography;

export default function PurchaseOrders() {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    navigate(`/purchase-orders/${id}`, { state: { id } });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Actions",
      align: "right",
      actions: [
        {
          type: "view",
          label: (record) => {
            const isActive =
              dayjs(record.date).isAfter(dayjs(), "day") ||
              dayjs(record.date).isSame(dayjs(), "day");

            if (record.hasVoted) return "Already voted";
            return isActive ? "Vote now" : "Closed";
          },
          disabled: (record) => {
            const isActive =
              dayjs(record.date).isAfter(dayjs(), "day") ||
              dayjs(record.date).isSame(dayjs(), "day");

            return record.hasVoted || !isActive;
          },
          onClick: (record) => handleNavigate(record._id),
        },
      ],
    },
  ];

  return (
    <div>
      <TableTitle
        title="Purchase Orders"
        subtitle="Requests requiring your attention"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text="Add PO"
            showIcon
            onClick={() => navigate("/purchase-orders/create")}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable columns={columns} dataSource={sampleData} />
    </div>
  );
}
