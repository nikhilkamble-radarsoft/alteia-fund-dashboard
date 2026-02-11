import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";
import { inputFormatters } from "../../utils/utils";
import { useTranslation } from "react-i18next";

export default function ViewTrade() {
  const { callApi, loading } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [fundCategories, setFundCategories] = useState([]);

  const { t } = useTranslation("form");

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
      label: t("funds.title"),
      type: "input",
      rules: formRules.required(t("funds.title")),
      placeholder: t("funds.title_ph"),
    },
    {
      name: "category",
      label: t("funds.category"),
      type: "select",
      rules: formRules.required(t("funds.category")),
      options: fundCategories.map((cat) => ({ value: cat._id, label: cat.name })),
      placeholder: t("funds.category_ph"),
    },
    {
      name: "roi_range",
      label: t("funds.roi"),
      type: "number",
      rules: formRules.required(t("funds.roi")),
      placeholder: t("funds.roi_ph"),
    },

    {
      name: "duration_type",
      label: t("funds.duration_type"),
      type: "select",
      rules: formRules.required(t("funds.duration_type"), "select"),
      options: [
        { value: "open-ended", label: t("funds.duration_open") },
        { value: "close-ended", label: t("funds.duration_close") },
      ],
    },
    {
      name: "start_date",
      label: t("funds.start_date"),
      type: "date",
      rules: formRules.required(t("funds.start_date"), "date"),
      shouldShow: (formValues) => formValues.duration_type,
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;
          const today = dayjs().startOf("day");
          const endDate = form.getFieldValue("end_date");
          if (current.isAfter(today)) return true;
          if (endDate && current.isAfter(dayjs(endDate).startOf("day"))) {
            return true;
          }
          return false;
        },
      }),
    },
    {
      name: "end_date",
      label: t("funds.end_date"),
      type: "date",
      rules: formRules.required(t("funds.end_date"), "date"),
      shouldShow: (formValues) => formValues.duration_type === "close-ended",
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;
          const today = dayjs().startOf("day");
          const startDate = form.getFieldValue("start_date");
          if (current.isAfter(today)) return true;
          if (startDate && current.isBefore(dayjs(startDate).startOf("day"))) {
            return true;
          }
          return false;
        },
      }),
    },
    {
      name: "location",
      label: t("funds.location"),
      type: "input",
      rules: formRules.required(t("funds.location")),
    },
    {
      name: "status",
      label: t("funds.status"),
      type: "select",
      rules: formRules.required(t("funds.status")),
      options: [
        { value: "active", label: t("funds.active") },
        { value: "inactive", label: t("funds.inactive") },
      ],
      placeholder: t("funds.status_ph"),
    },
    {
      name: "minimum_investment",
      label: t("funds.min_investment"),
      type: "number",
      rules: formRules.required(t("funds.min_investment")),
      placeholder: t("funds.min_investment_ph"),
      ...inputFormatters.money,
    },
    {
      name: "nav_unit",
      label: t("funds.nav_unit"),
      type: "number",
      placeholder: t("funds.nav_unit_ph"),
      rules: formRules.required(t("funds.nav_unit")),
      ...inputFormatters.money,
    },
    {
      name: "fund_document",
      label: t("funds.documents"),
      type: "file",
      // Fixed: Previously passed "Proof of Address" incorrectly
      rules: formRules.required(t("funds.documents")),
      placeholder: t("funds.documents_ph"),
      accept: ["application/pdf"],
    },
    {
      name: "banner_image",
      label: t("funds.banner"),
      type: "file",
      placeholder: t("funds.banner_ph"),
      accept: ["image/png", "image/jpeg", "image/jpg"],
      rules: formRules.required(t("funds.banner")),
    },
    {
      name: "why_invest",
      label: t("funds.why_invest"),
      type: "input-list",
      placeholder: t("funds.why_invest_ph"),
      maxLength: 50,
    },
    {
      name: "risks_to_consider",
      label: t("funds.risks"),
      type: "input-list",
      placeholder: t("funds.risks_ph"),
      maxLength: 50,
    },
    {
      name: "aum",
      label: t("funds.aum"),
      type: "number",
      placeholder: t("funds.aum_ph"),
      rules: formRules.required(t("funds.aum")),
      ...inputFormatters.money,
    },
    {
      name: "short_description",
      label: t("funds.short_desc"),
      type: "textarea",
      rules: formRules.required(t("funds.short_desc")),
      rows: 4,
      maxLength: 150,
    },
  ];

  return (
    <FormBuilder
      formProps={{ autoComplete: "off" }}
      formConfig={formConfig}
      initialValues={{ ...data, category: data?.category?._id }}
      cancelText={t("common.back")}
      submitText={t("common.save")}
      onFinish={onFinish}
      loading={loading}
    />
  );
}
