import { Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { investorKycStatus } from "../../utils/constants";
import countryList from "../../utils/country_list.json";
import { useTranslation } from "react-i18next";

export default function Investors() {
  const navigate = useNavigate();
  const { t } = useTranslation("table");

  const columns = [
    {
      title: t("investors.columns.full_name"),
      dataIndex: "full_name",
      render: (text, record) => (
        <NavLink to={`/investors/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: t("common.columns.email"),
      dataIndex: "email",
    },
    {
      title: t("common.columns.phone"),
      dataIndex: "phone",
      render: (text, record) => {
        const phoneCode = countryList.find(
          (item) => item.country_of_residence === record.country,
        )?.phone_code;
        return `${phoneCode ? phoneCode + " " : ""}${text}`;
      },
    },
    {
      title: t("investors.columns.kyc_status"),
      dataIndex: "kyc_status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant;
        switch (text) {
          case investorKycStatus.approved:
            finalText = t("investors.kyc_status.verified");
            finalVariant = "success";
            break;
          case investorKycStatus.pending:
            finalText = t("investors.kyc_status.pending");
            finalVariant = "warning";
            break;
          case investorKycStatus.rejected:
            finalText = t("investors.kyc_status.denied");
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomBadge variant={finalVariant} label={finalText} />;
      },
    },
    {
      title: t("investors.columns.nationality"),
      dataIndex: "nationality",
    },
    {
      title: t("investors.columns.country"),
      dataIndex: "country",
    },
  ];

  return (
    <div>
      <TableTitle
        title={t("investors.title")}
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text={t("investors.add_new")}
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
