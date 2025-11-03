import { useState } from "react";
import { Typography, Form, Button, Space, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import FormBuilder from "../components/form/FormBuilder";

const { Title } = Typography;

export default function CreatePO() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([{ id: 1 }]);

  const ballotTypes = [
    { value: "election", label: "Election" },
    { value: "vote", label: "Vote" },
    { value: "survey", label: "Survey" },
  ];

  const positionOptions = [
    { value: "president", label: "President" },
    { value: "vice-president", label: "Vice President" },
    { value: "secretary", label: "Secretary" },
    { value: "treasurer", label: "Treasurer" },
  ];

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
  ];

  const addCandidate = () => {
    setCandidates([...candidates, { id: Date.now() }]);
  };

  const removeCandidate = (id) => {
    if (candidates.length > 1) {
      setCandidates(candidates.filter((c) => c.id !== id));
    }
  };

  const onFinish = (values) => {
    console.log("Form values:", values);
    message.success("Ballot created successfully!");
    navigate("/ballots");
  };

  const formConfig = [
    { name: "title", label: "Ballot Title", type: "input", rules: [{ required: true }] },
    {
      name: "type",
      label: "Ballot Type",
      type: "select",
      options: ballotTypes,
      rules: [{ required: true }],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      rules: [{ required: true }],
    },
    {
      name: "description",
      label: "Description",
      type: "file",
      multiple: true,
      rules: [{ required: true }],
    },
    { name: "startDate", label: "Start Date", type: "daterange", rules: [{ required: true }] },
    { name: "endDate", label: "End Date", type: "date", rules: [{ required: true }] },
    {
      name: "maxVotes",
      label: "Maximum Votes Per Voter",
      type: "number",
      rules: [{ required: true }],
    },
    {
      name: "anonymous",
      label: "Anonymous Voting",
      type: "select",
      placeholder: "Select Yes or No",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
      rules: [{ required: true }],
    },
  ];

  return (
    <FormBuilder
      formTitle="Upload a Purchase Order"
      formSubtitle="Upload your purchase order document here."
      formConfig={formConfig}
      onFinish={onFinish}
    />
  );
}
