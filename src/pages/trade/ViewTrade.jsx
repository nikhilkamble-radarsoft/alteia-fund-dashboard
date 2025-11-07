import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";

export default function ViewTrade() {
  const { callApi } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const formConfig = [
    {
      name: "title",
      label: "Title",
      type: "input",
      rules: formRules.required("Title"),
      placeholder: "Enter fund or trade name",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      rules: formRules.required("Category"),
      options: [
        { value: "Featured", label: "Featured" },
        { value: "Top ROI", label: "Top ROI" },
        { value: "Real Estate", label: "Real Estate" },
        { value: "Short-Term", label: "Short-Term" },
        { value: "Goal-Based", label: "Goal-Based" },
      ],
      placeholder: "Select category (e.g., Real Estate, Energy)",
    },
    {
      name: "roi_range",
      label: "ROI %",
      type: "number",
      rules: formRules.required("ROI"),
      placeholder: "Enter expected annual ROI (e.g., 8.5)",
    },

    {
      name: "duration",
      label: "Duration",
      type: "input",
      rules: formRules.required("Duration"),
    },
    {
      name: "location",
      label: "Location",
      type: "input",
      rules: formRules.required("Location"),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      rules: formRules.required("Status"),
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      placeholder: "Choose status",
    },
    {
      name: "minimum_investment",
      label: "Minimum Investment",
      type: "number",
      rules: formRules.required("Minimum Investment"),
      placeholder: "Enter minimum investment amount (e.g., 100000)",
    },
    {
      name: "nav_unit",
      label: "NAV/Unit",
      type: "number",
      placeholder: "Enter Net Asset Value per unit (e.g., 1237.18)",
      rules: formRules.required("NAV/Unit"),
    },
    {
      name: "fund_document",
      label: "Documents Upload",
      type: "file",
      rules: formRules.required("Proof of Address"),
      placeholder: "Upload fact sheets, PDFs, supporting docs",
      accept: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
    },
    {
      name: "banner_image",
      label: "Upload Trade Banner",
      type: "file",
      placeholder: "Formats: JPG, PNG (Max 5MB)",
      accept: ["image/png", "image/jpeg", "image/jpg"],
      rules: formRules.required("Banner Image"),
    },
    {
      name: "aum",
      label: "AUM (Assets Under Management)",
      type: "number",
      placeholder: "Enter current AUM (e.g., 32.87M)",
      rules: formRules.required("AUM"),
    },
    {
      name: "short_description",
      label: "Short Description",
      type: "textarea",
      rules: formRules.required("Short Description"),
      rows: 4,
      props: { maxLength: 150 },
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
