import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";
import { inputFormatters } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../logic/useLanguage";

export default function ViewPurchase() {
  const { t } = useTranslation("form");
  const { callApi, loading } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [funds, setFunds] = useState([]);
  const [investors, setInvestors] = useState([]);
  const location = useLocation();
  const { trade_id, user_id } = location.state || {};
  const { currentLang } = useLanguage();

  const fetchData = async () => {
    const { response } = await callApi({
      url: `/admin/purchase/list`,
      params: {
        purchasefund_id: id,
      },
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });

    const updatedData = {
      ...response.data,
      user_id: response.data.user._id,
      fund_id: response.data.fund._id,
    };

    setData(updatedData);
  };

  const onFinish = async (values) => {
    const formData = { ...values };
    if (id) formData.id = id;

    const { status } = await callApi({
      method: "post",
      url: id ? "/admin/purchase/update" : "/admin/purchase/create",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });

    if (status) {
      navigate("/purchase");
    }
  };

  const fetchFunds = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/get-trade-list",
        method: "post",
        data: {},
      });
      setFunds(response.data || []);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  };

  const fetchInvestors = async () => {
    try {
      const { response } = await callApi({
        url: "/admin/investor-list",
        method: "post",
        data: {
          kyc_status: ["approved"],
        },
      });
      setInvestors(response.data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    fetchFunds();
    fetchInvestors();
  }, [currentLang]);

  const formConfig = [
    {
      name: "fund_id",
      label: t("purchase.fund"),
      type: "select",
      rules: formRules.required(t("purchase.fund")),
      options: funds.map((fund) => ({ value: fund._id, label: fund.title })),
      placeholder: t("purchase.selectFund"),
    },
    {
      name: "user_id",
      label: t("purchase.investor"),
      type: "select",
      rules: formRules.required(t("purchase.investor")),
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: t("purchase.selectInvestor"),
    },
    {
      name: "fund_roi",
      label: t("purchase.fundROI"),
      type: "number",
      placeholder: t("purchase.enterFundROI"),
      min: 1,
      computed: (values) => {
        const selectedFund = funds.find((fund) => fund._id === values?.fund_id);
        return selectedFund?.roi_range ? Number(selectedFund?.roi_range) : null;
      },
      computedDeps: ["fund_id"],
    },
    {
      name: "user_amount",
      label: t("purchase.amountUSD"),
      type: "number",
      rules: formRules.required(t("purchase.amount")),
      placeholder: t("purchase.enterAmount"),
      ...inputFormatters.money,
    },
    {
      name: "fund_unit",
      label: t("purchase.units"),
      type: "number",
      rules: formRules.required(t("purchase.units")),
      placeholder: t("purchase.enterUnits"),
      min: 1,
    },
    {
      name: "fund_aum",
      label: t("purchase.currentAUM"),
      type: "number",
      placeholder: t("purchase.enterCurrentAUM"),
      rules: formRules.required(t("purchase.aum")),
      ...inputFormatters.money,
    },
  ];

  return (
    <FormBuilder
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={{ fund_id: trade_id, user_id, ...data }}
      cancelText={t("purchase.back")}
      submitText={t("purchase.save")}
      onFinish={onFinish}
      loading={loading}
      multiLanguage={null}
    />
  );
}
