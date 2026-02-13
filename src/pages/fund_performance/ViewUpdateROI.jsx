import React, { useEffect, useState } from "react";
import { useTopData } from "../../components/layout/AppLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import { Form, Button, Divider } from "antd";
import Field, { FormField } from "../../components/form/Field";
import CustomButton from "../../components/form/CustomButton";
import { useGlobalModal } from "../../logic/ModalProvider";
import TableTitle from "../../components/table/TableTitle";
import { years } from "./PortfolioChartSection";
import Title from "antd/es/typography/Title";
import { formatDate } from "../../utils/utils";
import { useTranslation } from "react-i18next";

const ViewUpdateROI = () => {
  const { t } = useTranslation("form");
  const { title, setTitle } = useTopData();
  const { callApi, loading } = useApi();
  const location = useLocation();
  const { year = new Date().getFullYear(), fund } = location.state || {};
  const { showError } = useGlobalModal();
  const [selectedYear, setSelectedYear] = useState(year);

  const navigate = useNavigate();

  const [currentROI, setCurrentROI] = useState({});
  const [form] = Form.useForm();

  const fundStart = fund?.start_date ? new Date(fund.start_date) : null;
  const fundEnd = fund?.end_date ? new Date(fund.end_date) : null;

  const startYear = fundStart?.getFullYear();
  const endYear = fundEnd?.getFullYear();

  const validYears = years.filter((y) => {
    if (startYear && y < startYear) return false;
    if (endYear && y > endYear) return false;
    return true;
  });

  const fetchROI = async () => {
    try {
      const { response } = await callApi({
        url: `/admin/get-roi-list`,
        method: "get",
        params: { year: selectedYear, fund_id: fund._id },
        errorOptions: {
          onOk: () => navigate(-1),
        },
      });

      const localROI = response.data;
      const updatedROI = {};
      localROI.map((roi) => {
        updatedROI[roi.month] = roi?.max_roi;
      });

      setCurrentROI(updatedROI || {});

      // Dynamic Title Translation
      const titleSuffix = fund.title ? `- ${fund.title}` : "";
      const yearSuffix = selectedYear ? `(${t("roi.year")}-${selectedYear})` : "";

      setTitle(`${t("roi.monthlyInput")} ${titleSuffix} ${yearSuffix}`);
    } catch (error) {
      console.error("Error fetching ROI:", error);
    }
  };

  useEffect(() => {
    if (fund) {
      fetchROI();
    } else {
      navigate(-1);
    }
  }, [fund, selectedYear, t]); // Added t dependency

  useEffect(() => {
    if (!validYears.includes(selectedYear)) {
      const fallbackYear = validYears[validYears.length - 1];
      setSelectedYear(fallbackYear);
    }
  }, [validYears]);

  // Keep these as English keys for the backend/logic
  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const filteredMonths = monthsList.filter((month, index) => {
    if (!fundStart && !fundEnd) return true;

    const monthIndex = index; // 0–11

    if (startYear && selectedYear === startYear && monthIndex < fundStart.getMonth()) {
      return false;
    }

    if (endYear && selectedYear === endYear && monthIndex > fundEnd.getMonth()) {
      return false;
    }

    return true;
  });

  // keep form in sync when ROI data loads
  useEffect(() => {
    form.resetFields();
    if (Object.keys(currentROI).length > 0) {
      form.setFieldsValue(currentROI);
    }
  }, [currentROI, form]);

  const handleSubmit = async (values) => {
    try {
      const roi_list = monthsList
        .map((m) =>
          values[m] !== undefined && values[m] !== null
            ? {
                fund_id: fund._id,
                year: `${selectedYear}`,
                month: m, // Sending English month to backend
                less_roi: "0",
                max_roi: `${Number(values?.[m] || 0)}`,
              }
            : null,
        )
        .filter(Boolean);

      if (!roi_list.length) {
        return showError(t("roi.errorAtLeastOne"));
      }

      await callApi({
        url: `/admin/add-update-roi`,
        method: "post",
        data: roi_list,
        successOptions: {
          onOk: () => navigate("/roi"),
        },
        errorOptions: {},
      });
    } catch (error) {
      console.error("Error updating ROI:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between gap-3 items-center min-w-0 w-full">
        <Title
          title={fund.title}
          level={5}
          className={`font-bold m-0 min-w-0 text-primary`}
          ellipsis
        >
          {fund.title} ({formatDate(fund.start_date)}
          {fund.end_date && `- ${formatDate(fund.end_date)}`})
        </Title>

        <Field
          type="select"
          options={validYears.map((y) => ({ value: y, label: y }))}
          value={selectedYear}
          onChange={setSelectedYear}
          className="w-32"
          allowClear={false}
        />
      </div>

      <Divider className="my-2" variant="dotted" />

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 px-2">
          <div className="text-primary font-bold">{t("roi.month")}</div>
          <div className="text-primary font-bold text-left">{t("roi.roiPercent")}</div>
        </div>

        <div className="rounded-lg">
          {filteredMonths.map((m) => (
            <div key={m} className="grid grid-cols-2 gap-3 px-3 py-2">
              {/* Display Translated Month Name, but value is purely visual here */}
              <FormField
                value={t(`months.${m.toLowerCase()}`, { ns: "common" })}
                type="input"
                placeholder={t("roi.month")}
                disabled={true}
                form={form}
              />
              {/* Input binds to 'm' (English key) so form state matches backend expectation */}
              <FormField
                name={m}
                type="number"
                placeholder={t("roi.roiPercent")}
                disabled={loading}
                form={form}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <CustomButton
            type="primary"
            htmlType="submit"
            loading={loading}
            text={t("common.save")}
            width=""
          />
        </div>
      </Form>
    </div>
  );
};

export default ViewUpdateROI;
