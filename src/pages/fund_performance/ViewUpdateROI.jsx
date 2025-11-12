import React, { useEffect, useState } from "react";
import { useTopData } from "../../components/layout/AppLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import { Form, Button } from "antd";
import Field, { FormField } from "../../components/form/Field";
import CustomButton from "../../components/form/CustomButton";
import { useGlobalModal } from "../../logic/ModalProvider";

const ViewUpdateROI = () => {
  const { title, setTitle } = useTopData();
  const { id } = useParams();
  const { callApi, loading } = useApi();
  const location = useLocation();
  const { year = new Date().getFullYear() } = location.state || {};
  const { showError } = useGlobalModal();

  const navigate = useNavigate();

  const [currentROI, setCurrentROI] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    setTitle(`Monthly ROI Input - Year ${year}`);
  }, [year, title]);

  const fetchROI = async () => {
    try {
      const { response } = await callApi({
        url: `/admin/get-roi-list`,
        method: "get",
        params: { year, fund_id: id },
        errorOptions: {
          onOk: () => navigate(-1),
        },
      });

      const localROI = response.data;
      const updatedROI = {};
      localROI.map((roi) => {
        updatedROI[roi.month] = roi;
      });
      setCurrentROI(updatedROI);
    } catch (error) {
      console.error("Error fetching ROI:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchROI();
    } else {
      navigate(-1);
    }
  }, [id]);

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

  // keep form in sync when ROI data loads
  useEffect(() => {
    const mapped = Object.fromEntries(
      monthsList.map((m) => [m, currentROI[m]?.max_roi ?? undefined])
    );
    form.setFieldsValue(mapped);
  }, [currentROI, form]);

  const handleSubmit = async (values) => {
    try {
      const roi_list = monthsList
        .map((m) =>
          values[m] !== undefined && values[m] !== null
            ? {
                fund_id: id,
                year: `${year}`,
                month: m,
                less_roi: "0",
                max_roi: `${Number(values?.[m] || 0)}`,
              }
            : null
        )
        .filter(Boolean);

      if (!roi_list.length) {
        return showError("Please enter at least one ROI");
      }

      await callApi({
        url: `/admin/add-update-roi`,
        method: "post",
        data: roi_list,
        successOptions: {
          onOk: () => navigate(-1),
        },
        errorOptions: {},
      });
    } catch (error) {
      console.error("Error updating ROI:", error);
    }
  };

  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        initialValues={Object.fromEntries(
          monthsList.map((m) => [m, currentROI[m]?.roi?.max_roi ?? undefined])
        )}
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-3 px-2">
          <div className="text-primary font-bold">Month</div>
          <div className="text-primary font-bold text-left">ROI%</div>
        </div>

        <div className="rounded-lg">
          {monthsList.map((m) => (
            <div key={m} className="grid grid-cols-2 gap-3 px-3 py-2">
              <FormField value={m} type="input" placeholder="Month" disabled={true} form={form} />
              <FormField name={m} type="number" placeholder="ROI%" disabled={loading} form={form} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <CustomButton type="primary" htmlType="submit" loading={loading} text="Save" width="" />
        </div>
      </Form>
    </div>
  );
};

export default ViewUpdateROI;
