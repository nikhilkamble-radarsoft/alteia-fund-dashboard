import { Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { investorKycStatus } from "../../utils/constants";
import countryList from "../../utils/country_list.json";

export default function Investors() {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "full_name",
      render: (text, record) => (
        <NavLink to={`/investors/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (text, record) => {
        const phoneCode = countryList.find(
          (item) => item.country_of_residence === record.country
        )?.phone_code;
        return `${phoneCode ? phoneCode + " " : ""}${text}`;
      },
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
  ];

  return (
    <div>
      <TableTitle
        title="Customers investing"
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text="Add New Customer"
            showIcon
            onClick={() => navigate("/investors/create")}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/investor-list",
          method: "post",
          data: {
            kyc_status: ["approved"],
          },
        }}
      />
    </div>
  );
}
