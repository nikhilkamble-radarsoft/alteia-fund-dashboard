import React, { useEffect, useState } from "react";
import { useTopData } from "../../components/layout/AppLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useApi from "../../logic/useApi";
import { Form, Button } from "antd";
import Field from "../../components/form/Field";

const ViewUpdateROI = () => {
  const { title, setTitle } = useTopData();
  const { id } = useParams();
  const { callApi, loading } = useApi();
  const location = useLocation();
  const { year = new Date().getFullYear() } = location.state || {};

  const navigate = useNavigate();

  const [currentROI, setCurrentROI] = useState({});
  const [form] = Form.useForm();

  console.log("location.state", location.state);

  useEffect(() => {
    setTitle(`Monthly ROI Input - Year ${year}`);
  }, [year, title]);

  const fetchROI = async () => {
    try {
      const { response } = await callApi({
        url: `/admin/get-roi-list`,
        method: "get",
        params: { year, fund_id: id },
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

  // keep form in sync when ROI data loads
  useEffect(() => {
    const months = [
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
    const mapped = Object.fromEntries(months.map((m) => [m, currentROI[m]?.roi ?? undefined]));
    form.setFieldsValue(mapped);
  }, [currentROI, form]);

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

  const handleSubmit = async (values) => {
    try {
      const roi_list = monthsList
        .map((m) =>
          values[m] !== undefined && values[m] !== null
            ? { month: m, roi: Number(values[m]) }
            : null
        )
        .filter(Boolean);

      const { response } = await callApi({
        url: `/admin/update-roi`,
        method: "post",
        data: { year, fund_id: id, roi_list },
      });
      console.log("response", response);
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
          monthsList.map((m) => [m, currentROI[m]?.roi ?? undefined])
        )}
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-3 mb-3 px-2">
          <div className="text-primary font-bold">Month</div>
          <div className="text-primary font-bold text-right">ROI%</div>
        </div>

        <div className="rounded-lg">
          {monthsList.map((m) => (
            <div key={m} className="grid grid-cols-2 items-center gap-3 px-3 py-2">
              <div className="text-gray-800 font-medium">{m}</div>
              <div className="flex justify-end">
                <Form.Item name={m} noStyle>
                  <Field
                    type="number"
                    className="w-[140px]"
                    placeholder="ROI%"
                    disabled={loading}
                    form={form}
                  />
                </Form.Item>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ViewUpdateROI;
