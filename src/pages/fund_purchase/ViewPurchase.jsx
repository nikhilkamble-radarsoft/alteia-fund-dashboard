import { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";
import { inputFormatters } from "../../utils/utils";

export default function ViewPurchase() {
  const { callApi, loading } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [funds, setFunds] = useState([]);
  const [investors, setInvestors] = useState([]);
  const location = useLocation();
  const { trade_id, user_id } = location.state || {};

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
    fetchFunds();
    fetchInvestors();
  }, [id]);

  const formConfig = [
    {
      name: "fund_id",
      label: "Fund",
      type: "select",
      rules: formRules.required("Fund"),
      options: funds.map((fund) => ({ value: fund._id, label: fund.title })),
      placeholder: "Select fund",
    },
    {
      name: "user_id",
      label: "Investor",
      type: "select",
      rules: formRules.required("Investor"),
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: "Select investor",
    },
    {
      name: "fund_roi",
      label: "Fund ROI",
      type: "number",
      placeholder: "Enter fund roi (e.g., 7.18)",
      min: 1,
      computed: (values) => {
        const selectedFund = funds.find((fund) => fund._id === values.fund_id);
        return Number(selectedFund?.roi_range) || undefined;
      },
      computedDeps: ["fund_id"],
    },
    {
      name: "user_amount",
      label: "Amount ($)",
      type: "number",
      rules: formRules.required("Amount"),
      placeholder: "Enter amount",
      ...inputFormatters.money,
    },
    {
      name: "fund_unit",
      label: "Units",
      type: "number",
      rules: formRules.required("Units"),
      placeholder: "Enter units (e.g., 1237.18)",
      min: 1,
    },
    // {
    //   name: "unit_price",
    //   label: "Unit Price ($)",
    //   type: "number",
    //   rules: formRules.required("Unit Price"),
    //   placeholder: "Enter unit price (e.g., $1237.18)",
    //   computed: (values) => {
    //     const amount = Number(values?.user_amount ?? 0);
    //     const units = Number(values?.units ?? 0);
    //     if (!units) return undefined;
    //     const price = amount / units;
    //     if (!Number.isFinite(price)) return undefined;
    //     return Number(price.toFixed(2));
    //   },
    //   computedDeps: ["amount", "units"],
    //   ...inputFormatters.money,
    // },
    {
      name: "fund_aum",
      label: "Current AUM ($)",
      type: "number",
      placeholder: "Enter current AUM (e.g., $32.87)",
      rules: formRules.required("AUM"),
      ...inputFormatters.money,
    },
    // {
    //   name: "remarks",
    //   label: "Remarks",
    //   type: "textarea",
    //   rows: 4,
    //   maxLength: 150,
    // },
  ];

  return (
    <FormBuilder
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={{ fund_id: trade_id, user_id, ...data }}
      cancelText="Back"
      submitText="Save"
      onFinish={onFinish}
      loading={loading}
    />
  );
}
