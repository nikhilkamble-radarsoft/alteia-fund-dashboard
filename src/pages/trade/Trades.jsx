import { Typography, Button, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { investorKycStatus } from "../../utils/constants";

const { Title } = Typography;

export default function Trades() {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    navigate(`/trades/${id}`, { state: { id } });
  };

  const columns = [
    {
      title: "Trade Title",
      dataIndex: "title",
      render: (text, record) => (
        <Button type="link" onClick={() => handleNavigate(record._id)} className="p-0">
          {text}
        </Button>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "ROI %",
      dataIndex: "roi_range",
      render: (text, record) => `${text} (YTD ${record.ytd_return})`,
    },
    {
      title: "Min. Investment",
      dataIndex: "minimum_investment",
    },
    {
      title: "Duration",
      dataIndex: "duration",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    // {
    //   title: "Actions",
    //   actions: [
    //     {
    //       type: "view",
    //       label: "View",
    //       onClick: (record) => handleNavigate(record._id),
    //     },
    //   ],
    // },
  ];

  return (
    <div>
      <TableTitle
        title="Trades Listing"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton text="Add New Trade" showIcon onClick={() => navigate("/trades/create")} />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/get-trade-list",
          method: "post",
        }}
      />
    </div>
  );
}
