import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";
import { inputFormatters } from "../../utils/utils";

export default function ViewTrade() {
  const { callApi, loading = { loading } } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [fundCategories, setFundCategories] = useState([]);

  const fetchData = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/get-trade-list`,
      data: {
        fund_id: id,
      },
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });

    const localData = response.data;

    const updatedData = {
      ...localData,
      dob: dayjs(localData.dob),
    };
    setData(updatedData);
  };

  const fetchFundCategories = async () => {
    const { response } = await callApi({
      method: "get",
      url: `/admin/fund-category`,
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });
    setFundCategories(response.data || []);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (!values[key]) return;
      // Upload files
      if (["fund_document", "banner_image"].includes(key) && values[key][0].originFileObj)
        return formData.append(key, values[key][0].originFileObj);

      if (Array.isArray(values[key])) {
        values[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, values[key]);
      }
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
      navigate("/funds");
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
    fetchFundCategories();
  }, [id]);

  const formConfig = [
    {
      name: "title",
      label: "Title",
      type: "input",
      rules: formRules.required("Title"),
      placeholder: "Enter Fund name",
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      rules: formRules.required("Category"),
      options: fundCategories.map((cat) => ({ value: cat._id, label: cat.name })),
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
      name: "duration_type",
      label: "Duration Type",
      type: "select",
      rules: formRules.required("Duration Type", "select"),
      options: [
        { value: "open-ended", label: "Open-ended" },
        { value: "close-ended", label: "Close-ended" },
      ],
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      rules: formRules.required("Start Date", "date"),
      shouldShow: (formValues) => formValues.duration_type,
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;

          const today = dayjs().startOf("day");
          const endDate = form.getFieldValue("end_date");

          // cannot be future
          if (current.isAfter(today)) return true;

          // cannot be after end_date
          if (endDate && current.isAfter(dayjs(endDate).startOf("day"))) {
            return true;
          }

          return false;
        },
      }),
    },
    {
      name: "end_date",
      label: "End Date",
      type: "date",
      rules: formRules.required("End Date", "date"),
      shouldShow: (formValues) => formValues.duration_type === "close-ended",
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;

          const today = dayjs().startOf("day");
          const startDate = form.getFieldValue("start_date");

          // cannot be future
          if (current.isAfter(today)) return true;

          // cannot be before start_date
          if (startDate && current.isBefore(dayjs(startDate).startOf("day"))) {
            return true;
          }

          return false;
        },
      }),
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
      label: "Minimum Investment ($)",
      type: "number",
      rules: formRules.required("Minimum Investment"),
      placeholder: "Enter minimum investment amount (e.g., $100,000)",
      ...inputFormatters.money,
    },
    {
      name: "nav_unit",
      label: "NAV/Unit ($)",
      type: "number",
      placeholder: "Enter Net Asset Value per unit (e.g., $1237.18)",
      rules: formRules.required("NAV/Unit"),
      ...inputFormatters.money,
    },
    {
      name: "fund_document",
      label: "Documents Upload",
      type: "file",
      rules: formRules.required("Proof of Address"),
      placeholder: "Upload fact sheets, PDFs, supporting docs",
      accept: ["application/pdf"],
    },
    {
      name: "banner_image",
      label: "Upload Fund Banner",
      type: "file",
      placeholder: "Formats: JPG, PNG (Max 5MB)",
      accept: ["image/png", "image/jpeg", "image/jpg"],
      rules: formRules.required("Banner Image"),
    },
    {
      name: "why_invest",
      label: "Why invest in this Fund?",
      type: "input-list",
      placeholder: "Enter why invest in this Fund",
      maxLength: 50,
    },
    {
      name: "risks_to_consider",
      label: "Risks to consider",
      type: "input-list",
      placeholder: "Enter risks to consider",
      maxLength: 50,
    },
    {
      name: "aum",
      label: "AUM (Assets Under Management) ($)",
      type: "number",
      placeholder: "Enter current AUM (e.g., $32.87)",
      rules: formRules.required("AUM"),
      ...inputFormatters.money,
    },
    {
      name: "short_description",
      label: "Short Description",
      type: "textarea",
      rules: formRules.required("Short Description"),
      rows: 4,
      maxLength: 150,
    },
  ];

  return (
    <FormBuilder
      // mode="view-only"
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={{ ...data, category: data?.category?._id }}
      cancelText="Back"
      submitText="Save"
      onFinish={onFinish}
      loading={loading}
    />
  );
}
