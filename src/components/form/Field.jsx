// src/components/form/Field.jsx
import React from "react";
import {
  Input,
  Select,
  DatePicker,
  TimePicker,
  InputNumber,
  Upload,
  Button,
  Checkbox,
  Form,
  Divider,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { PiCross, PiEye, PiEyeSlash, PiUploadFill } from "react-icons/pi";
import CustomButton from "./CustomButton";
import { useMediaQuery } from "react-responsive";
import { LuPlus } from "react-icons/lu";
import Paragraph from "antd/es/typography/Paragraph";
import clsx from "clsx";
import CustomBadge from "../common/CustomBadge";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;

export default function Field({
  type = "input",
  className = "w-full",
  placeholder,
  options = [],
  value,
  onChange,
  rows = 4,
  accept,
  multiple = false,
  showSearch = true,
  allowClear = true,
  // pass-through props for special controls
  datePickerProps = {},
  uploadProps = {},
  selectProps = {},
  // arbitrary extra props
  ...rest
}) {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // sensible defaults for placeholders if not passed
  const defaultPlaceholder =
    placeholder ??
    {
      select: "Select",
      textarea: "Enter",
      date: "Select",
      daterange: ["Start", "End"],
      time: "Select",
      number: "Enter",
      file: "Upload",
      default: "Enter",
    }[type] ??
    "Enter";

  const common = { className, size: "large", ...rest };

  switch (type) {
    case "select":
      return (
        <Select
          {...common}
          placeholder={defaultPlaceholder === "Select" ? `Select` : defaultPlaceholder}
          value={value}
          onChange={onChange}
          allowClear={allowClear}
          showSearch={showSearch}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children?.toString().toLowerCase().includes(input.toLowerCase())
          }
          {...selectProps}
        >
          {(options || []).map((o) => (
            <Select.Option key={o.value} value={o.value}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      );

    case "textarea":
      return (
        <Input.TextArea
          {...common}
          placeholder={
            typeof defaultPlaceholder === "string" ? defaultPlaceholder : rest.placeholder
          }
          rows={rows}
          value={value}
          onChange={onChange}
        />
      );

    case "date":
      return (
        <DatePicker
          {...common}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
          {...datePickerProps}
        />
      );

    case "daterange":
      return (
        <RangePicker
          {...common}
          placeholder={Array.isArray(defaultPlaceholder) ? defaultPlaceholder : ["Start", "End"]}
          value={value}
          onChange={onChange}
          {...datePickerProps}
        />
      );

    case "time":
      return (
        <TimePicker
          {...common}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <InputNumber
          {...common}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
          className={className}
        />
      );

    case "file": {
      const [internalList, setInternalList] = React.useState([]);
      const { showView = true, showDownload = false } = uploadProps;

      const handleChange = ({ fileList }) => {
        let list = multiple ? fileList : fileList.slice(-1); // respect "multiple"
        setInternalList(list);

        // let AntD Form hook into value (so Form.getFieldValue works)
        onChange?.(list);
      };
      const { status } = Form.Item.useStatus?.() ?? {};
      const isError = status === "error";

      return (
        <div className="space-y-2">
          {!common.hidden && (multiple || internalList.length === 0) && (
            <Upload
              {...common}
              beforeUpload={() => false}
              accept={accept}
              multiple={multiple}
              fileList={internalList}
              onChange={handleChange}
              showUploadList={false}
              {...uploadProps}
            >
              <div
                className={clsx(
                  `ant-input border border-gray-300 h-[111px] w-full 
            flex flex-col gap-1 justify-center items-center cursor-pointer rounded-lg transition-all transform-duration-300 bg-[url("/assets/file-upload-bg.png")] bg-cover bg-center`,
                  internalList.length > 0 ? "mb-3" : "",
                  isError
                    ? "!border-danger hover:border-danger"
                    : "border-gray-300 hover:border-primary"
                )}
              >
                <div className="rounded-full bg-white border border-gray-300 p-1">
                  <PiUploadFill className="text-light-primary" size={24} />
                </div>
                <Paragraph className="mb-0 text-center">{defaultPlaceholder}</Paragraph>
              </div>
            </Upload>
          )}

          {/* Custom preview list */}
          {internalList.map((file) => (
            <div
              key={file.uid}
              className="h-[40px] relative group flex justify-between items-center border border-gray-300 rounded-lg bg-white"
            >
              <CustomBadge label={file.name} />

              <div className="flex text-sm relative">
                {showView && (
                  <CustomButton
                    btnType="secondary"
                    onClick={() => window.open(URL.createObjectURL(file.originFileObj))}
                    className="!rounded-none !h-[39px]"
                    text="View"
                  />
                )}
                {showDownload && (
                  <a href={URL.createObjectURL(file.originFileObj)} download={file.name}>
                    <CustomButton
                      type="link"
                      className="!rounded-l-none !h-[39px]"
                      text="Download"
                    />
                  </a>
                )}

                <button
                  onClick={() => {
                    const updated = internalList.filter((f) => f.uid !== file.uid);
                    setInternalList(updated);
                    onChange?.(updated);
                  }}
                  className={`
          absolute top-[-7px] right-[-7px] rounded-full bg-background transition
          ${isMobile ? "flex" : "hidden group-hover:flex hover:cursor-pointer"}
        `}
                >
                  <LuPlus
                    size={16}
                    className="rotate-45 text-gray-700 hover:text-red-600 transition-all"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "checkbox":
      return <Checkbox {...props}>{children || props.label}</Checkbox>;

    case "custom":
      // custom render passed via "render" prop
      return rest.render?.({ value, onChange }) ?? null;

    case "password":
      return (
        <Input.Password
          {...common}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
          iconRender={
            rest.iconRender ||
            ((visible) =>
              visible ? (
                <PiEyeSlash style={{ fontSize: 20, cursor: "pointer", color: "rgba(0,0,0,.45)" }} />
              ) : (
                <PiEye style={{ fontSize: 20, cursor: "pointer", color: "rgba(0,0,0,.45)" }} />
              ))
          }
        />
      );

    default:
      return (
        <Input {...common} placeholder={defaultPlaceholder} value={value} onChange={onChange} />
      );
  }
}

export function FormField({
  name,
  label,
  type = "input",
  rules,
  valuePropName,
  placeholder,
  options = [],
  props = {},
  formItemProps = {},
}) {
  if (type === "checkbox") {
    return (
      <Form.Item key={name} name={name} rules={rules} valuePropName="checked" {...formItemProps}>
        <Checkbox {...props}>{label}</Checkbox>
      </Form.Item>
    );
  }

  return (
    <Form.Item
      key={name}
      name={name}
      label={label}
      rules={rules}
      valuePropName={valuePropName}
      {...formItemProps}
    >
      <Field type={type} placeholder={placeholder} options={options} rows={props.rows} {...props} />
    </Form.Item>
  );
}
