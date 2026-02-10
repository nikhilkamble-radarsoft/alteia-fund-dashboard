import { Divider } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import { formatDate, outputFormatters } from "../../utils/utils";
import { useTranslation } from "react-i18next";

export default function FundPurchases() {
  const navigate = useNavigate();
  const { t } = useTranslation("table");

  const columns = [
    {
      title: t("purchases.columns.fund_name"),
      dataIndex: "fund.title",
      render: (text, record) => (
        <NavLink to={`/purchase/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: t("purchases.columns.investor_name"),
      dataIndex: "user.full_name",
    },
    {
      title: t("purchases.columns.amount"),
      dataIndex: "user_amount",
      render: (text) => outputFormatters.money(text),
    },
    {
      title: t("purchases.columns.units"),
      dataIndex: "fund_unit",
    },
    {
      title: t("purchases.columns.date"),
      dataIndex: "purchase_date",
      render: (text) => formatDate(text),
    },
  ];

  return (
    <div>
      <TableTitle
        title={t("purchases.title")}
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text={t("purchases.add_new")}
            showIcon
            onClick={() => navigate("/purchase/create")}
          />,
        ]}
      />
      <Divider variant="dashed" className="my-2" />
      <CustomTable
        columns={columns}
        apiConfig={{
          url: "/admin/purchase/list",
          totalAccessorKey: "totalRecords",
        }}
      />
    </div>
  );
}
