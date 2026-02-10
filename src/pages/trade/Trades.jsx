import { Typography, Button, Divider } from "antd";
import { Link, NavLink, useNavigate } from "react-router-dom";
import CustomTable from "../../components/table/CustomTable";
import CustomButton from "../../components/form/CustomButton";
import TableTitle from "../../components/table/TableTitle";
import CustomBadge from "../../components/common/CustomBadge";
import { tableFallbackText, tradeStatus } from "../../utils/constants";
import CustomTag from "../../components/common/CustomTag";
import { formatDate, outputFormatters, sanitizeText } from "../../utils/utils";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function Trades() {
  const navigate = useNavigate();
  const { t } = useTranslation("table");

  const columns = [
    {
      title: t("funds.columns.fund_title"),
      dataIndex: "title",
      render: (text, record) => (
        <NavLink to={`/funds/${record._id}`} className="p-0">
          {text}
        </NavLink>
      ),
    },
    {
      title: t("funds.columns.category"),
      dataIndex: "category.name",
    },
    {
      title: t("funds.columns.roi"),
      dataIndex: "roi_range",
      render: (text, record) => {
        const roi = text?.endsWith("%") ? text : `${text}%`;
        const ytdLabel = t("common.ytd", "YTD");
        return `${roi} ${record.ytd_return ? `(${ytdLabel} ${record.ytd_return || "-"})` : ""}`;
      },
    },
    {
      title: t("funds.columns.min_investment"),
      dataIndex: "minimum_investment",
      render: (text) => outputFormatters.money(text) || tableFallbackText,
    },
    {
      title: t("funds.columns.duration_type"),
      dataIndex: "duration_type",
      render: (text) => sanitizeText(text) || tableFallbackText,
    },
    {
      title: t("funds.columns.start_date"),
      dataIndex: "start_date",
      render: (text) => formatDate(text) || tableFallbackText,
    },
    {
      title: t("funds.columns.end_date"),
      dataIndex: "end_date",
      render: (text) => formatDate(text) || tableFallbackText,
    },
    {
      title: t("common.columns.status"),
      dataIndex: "status",
      render: (text) => {
        let finalText = text?.toLowerCase();
        let finalVariant, customColors;
        switch (text) {
          case tradeStatus.active:
            finalText = t("funds.status.active");
            finalVariant = "success";
            break;
          case tradeStatus.inactive:
            finalText = t("funds.status.inactive");
            finalVariant = "danger";
            break;
          default:
            break;
        }
        return <CustomTag variant={finalVariant} text={finalText} customColors={customColors} />;
      },
    },
  ];

  return (
    <div>
      <TableTitle
        title={t("funds.title")}
        titleColor="text-black"
        subtitleColor="text-black"
        buttons={[
          <CustomButton
            text={t("funds.add_new")}
            showIcon
            onClick={() => navigate("/funds/create")}
          />,
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
