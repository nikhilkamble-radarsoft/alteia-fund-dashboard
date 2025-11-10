import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";

export default function ViewPurchase() {
  const { callApi } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [funds, setFunds] = useState([]);
  const [investors, setInvestors] = useState([]);

  const fetchData = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/get-trade-list`,
      data: {
        fund_id: id,
      },
      errorOptions: {
        onOk: () => navigate("/trades"),
      },
    });

    const localData = response.data;

    const updatedData = {
      ...localData,
      dob: dayjs(localData.dob),
    };
    setData(updatedData);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      // Upload files
      if (["fund_document", "banner_image"].includes(key))
        return formData.append(key, values[key][0].originFileObj);

      formData.append(key, values[key]);
    });

    if (!id) formData.append("created_by", user._id);
    if (id) formData.append("fund_id", id);

    const { status } = await callApi({
      method: "post",
      url: id ? "/admin/update-trade" : "/admin/add-trade",
      data: formData,
      successOptions: {},
      errorOptions: {},
    });

    if (status) {
      navigate("/trades");
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
        data: {},
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
      name: "investor_id",
      label: "Investor",
      type: "select",
      rules: formRules.required("Investor"),
      options: investors.map((investor) => ({ value: investor._id, label: investor.full_name })),
      placeholder: "Select investor",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      rules: formRules.required("Amount"),
      placeholder: "Enter amount",
    },
    {
      name: "payment_method",
      label: "Payment Method",
      type: "select",
      rules: formRules.required("Payment Method"),
      options: [
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "cash", label: "Cash" },
        { value: "cheque", label: "Cheque" },
      ],
      placeholder: "Select payment method",
    },
    {
      name: "payment_status",
      label: "Payment Status",
      type: "select",
      rules: formRules.required("Payment Status"),
      options: [
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
      ],
      placeholder: "Select payment status",
    },
    {
      name: "units",
      label: "Units",
      type: "number",
      rules: formRules.required("Units"),
      placeholder: "Enter units (e.g., 1237.18)",
    },
    {
      name: "unit_price",
      label: "Unit Price",
      type: "number",
      rules: formRules.required("Unit Price"),
      placeholder: "Enter unit price (e.g., 1237.18)",

      formatter: (value) => {
        if (value === undefined || value === "") return "";
        const [intRaw, decRaw] = String(value).split(".");
        const intFmt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `$ ${intFmt}${decRaw !== undefined ? `.${decRaw}` : ""}`;
      },
      parser: (val) => (val ? val.replace(/\$\s?|,/g, "") : ""),
      precision: 2,
      min: 0,
      max: 100_000_000_000,
      step: 1000,
    },
    {
      name: "aum",
      label: "Current AUM",
      type: "number",
      placeholder: "Enter current AUM (e.g., 32.87M)",
      rules: formRules.required("AUM"),
    },
    {
      name: "proof_of_payment",
      label: "Proof of Payment",
      type: "file",
      rules: formRules.required("Proof of Payment"),
      placeholder: "Upload proof of payment",
      accept: ["application/pdf"],
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      rules: formRules.required("Remarks"),
      rows: 4,
      maxLength: 150,
    },
  ];

  return (
    <FormBuilder
      // mode="view-only"
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={data}
      cancelText="Back"
      submitText="Save"
      onFinish={onFinish}
    />
  );
}
