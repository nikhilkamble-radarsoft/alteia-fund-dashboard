import React, { useEffect, useState } from "react";
import FormBuilder from "../../components/form/FormBuilder";
import { useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import dayjs from "dayjs";
import { formRules } from "../../utils/constants";
import { useSelector } from "react-redux";
import { inputFormatters } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../logic/useLanguage";

export default function ViewTrade() {
  const { callApi, loading } = useApi();
  const [data, setData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [fundCategories, setFundCategories] = useState([]);
  const { currentLang } = useLanguage();

  const { t } = useTranslation("form");

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

  const fetchData = async () => {
    const { response } = await callApi({
      method: "post",
      url: `/admin/get-trade-list`,
      data: {
        fund_id: id,
      },
      params: { skipDefaultTransform: true },
      errorOptions: {
        onOk: () => navigate(-1),
      },
    });

    const data = response.data;

    const formattedData = {
      en: {
        ...data,

        title: data.title?.en,
        short_description: data.short_description?.en,
        location: data.location?.en,

        why_invest: data.why_invest?.en || [],
        risks_to_consider: data.risks_to_consider?.en || [],

        start_date: data.start_date ? dayjs(data.start_date) : null,
        end_date: data.end_date ? dayjs(data.end_date) : null,
        banner_image: data.banner_image,
        fund_document: data.fund_document,
      },
      ar: {
        title: data.title?.ar,
        short_description: data.short_description?.ar,
        location: data.location?.ar,

        why_invest: data.why_invest?.ar || [],
        risks_to_consider: data.risks_to_consider?.ar || [],
      },
    };

    setData(formattedData);
  };

  const onFinish = async (formValues) => {
    const values = {
      en: { ...data?.en, ...formValues.en },
      ar: { ...data?.ar, ...formValues.ar },
    };

    const formData = new FormData();

    const appendSection = (sectionData, prefix) => {
      if (!sectionData) return;

      Object.keys(sectionData).forEach((key) => {
        const value = sectionData[key];

        if (value === undefined || value === null || value === "") return;

        if (
          ["banner_image", "fund_document"].includes(key) &&
          Array.isArray(value) &&
          value[0]?.originFileObj
        ) {
          formData.append(key, value[0].originFileObj);
          return;
        }

        if (
          ["banner_image", "fund_document"].includes(key) &&
          Array.isArray(value) &&
          !value[0]?.originFileObj
        ) {
          return;
        }

        if (Array.isArray(value)) {
          formData.append(`${prefix}[${key}]`, JSON.stringify(value));
          return;
        }

        if (dayjs.isDayjs(value)) {
          formData.append(`${prefix}[${key}]`, value.toISOString());
          return;
        }

        formData.append(`${prefix}[${key}]`, value);
      });
    };

    // Process merged English and Arabic data
    appendSection(values.en, "en");
    appendSection(values.ar, "ar");

    // Append IDs
    if (!id && user?._id) formData.append("en[created_by]", user._id);
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
  }, [id]);

  useEffect(() => {
    fetchFundCategories();
  }, [currentLang]);

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
      shouldShow: (formValues) => formValues.en?.duration_type,

      dependencies: [["en", "end_date"]],
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;
          const today = dayjs().startOf("day");

          const endDate = form.getFieldValue(["en", "end_date"]);

          if (current.isBefore(today)) return true;

          if (endDate && current.isAfter(dayjs(endDate).endOf("day"))) {
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
      shouldShow: (formValues) => formValues.en?.duration_type === "close-ended",

      dependencies: [["en", "start_date"]],
      datePickerProps: (form) => ({
        disabledDate: (current) => {
          if (!current) return false;
          const today = dayjs().startOf("day");

          const startDate = form.getFieldValue(["en", "start_date"]);

          if (current.isBefore(today)) return true;

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
      multiLanguage
    />
  );
}
