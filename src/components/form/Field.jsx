import { Input, Select, DatePicker, TimePicker, InputNumber, Checkbox, Form, Spin } from "antd";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { useMediaQuery } from "react-responsive";
import FileField from "./FileField";
import { useMemo } from "react";
import InputList from "./InputList";
import TagsInput from "./TagsInput";
import IconPicker from "./IconPicker";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function Field({
  type = "input",
  className = "w-full",
  placeholder,
  options = [],
  value,
  onChange,
  rows = 1,
  accept,
  multiple = false,
  showSearch = true,
  allowClear = true,
  // pass-through props for special controls
  datePickerProps = {},
  timePickerProps = {},
  uploadProps = {},
  selectProps = {},
  form, // AntD form instance
  fieldName,
  loading = false,
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

  const common = {
    ...rest,
    className,
    size: "large",
    suffix: rest.suffix || (loading ? <Spin size="small" /> : null),
    disabled: Boolean(loading || rest?.disabled),
  };

  const resolvedTimePickerProps =
    typeof timePickerProps === "function" && form ? timePickerProps(form) : timePickerProps;

  const resolvedDatePickerProps =
    typeof datePickerProps === "function" && form ? datePickerProps(form) : datePickerProps;

  switch (type) {
    case "input-list":
      return (
        <InputList {...common} placeholder={defaultPlaceholder} value={value} onChange={onChange} />
      );

    case "tags":
      return (
        <TagsInput {...common} placeholder={defaultPlaceholder} value={value} onChange={onChange} />
      );

    case "select":
      const shouldVirtualize = useMemo(() => options.length > 100, [options]);

      return (
        <Select
          {...selectProps}
          {...common}
          loading={loading}
          placeholder={defaultPlaceholder}
          allowClear={allowClear}
          showSearch={showSearch}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children?.toString().toLowerCase().includes(input.toLowerCase())
          }
          value={value}
          onChange={onChange}
          virtual={shouldVirtualize}
          styles={{ popup: { root: { scrollBehavior: "smooth" } } }}
        >
          {(options || []).map((o) => (
            <Select.Option key={o.value} value={o.value}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      );

    case "icon":
      return (
        <IconPicker
          {...common}
          value={value}
          onChange={onChange}
          placeholder={defaultPlaceholder}
          allowClear={true}
          iconSize={20}
          columns={6}
        />
      );

    case "textarea":
      return (
        <Input.TextArea
          {...common}
          placeholder={defaultPlaceholder}
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
          value={value ? dayjs(value) : null}
          onChange={onChange}
          format="DD/MM/YYYY"
          {...resolvedDatePickerProps}
        />
      );

    case "daterange":
      return (
        <RangePicker
          {...common}
          placeholder={Array.isArray(defaultPlaceholder) ? defaultPlaceholder : ["Start", "End"]}
          value={value ? [dayjs(value[0]), dayjs(value[1])] : []}
          onChange={onChange}
          {...resolvedDatePickerProps}
        />
      );

    case "time":
      return (
        <TimePicker
          {...common}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
          format="h:mm A"
          use12Hours
          {...resolvedTimePickerProps}
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
      return (
        <FileField
          className={className}
          placeholder={defaultPlaceholder}
          value={value}
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          uploadProps={uploadProps}
          form={form}
          fieldName={fieldName}
          disabled={common.disabled}
          hidden={common.hidden}
          loading={loading}
        />
      );
    }

    case "checkbox":
      return <Checkbox {...rest}>{rest.children || rest.label}</Checkbox>;

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
  formItemProps = {},
  form, // AntD form instance
  shouldShow,
  children,
  ...props
}) {
  if (type === "checkbox") {
    return (
      <Form.Item key={name} name={name} rules={rules} valuePropName="checked" {...formItemProps}>
        <Checkbox {...props}>{label}</Checkbox>
      </Form.Item>
    );
  }

  const placeholderMap = {
    select: `Select ${label}`,
    textarea: `Enter ${label}`,
    date: `Select ${label}`,
    daterange: [placeholder?.[0] || `Start ${label}`, placeholder?.[1] || `End ${label}`],
    time: `Select ${label}`,
    number: `Enter ${label}`,
    file: `Upload ${label}`,
    default: `Enter ${label}`,
  };

  const newPlaceholder = placeholder || placeholderMap[type] || placeholderMap.default;

  const inner = (
    <Form.Item
      key={name}
      name={name}
      label={label}
      rules={rules}
      valuePropName={valuePropName}
      className="w-full"
      {...formItemProps}
    >
      {children || (
        <Field
          type={type}
          placeholder={newPlaceholder}
          options={options}
          rows={props.rows}
          form={form}
          {...props}
        />
      )}
    </Form.Item>
  );

  if (typeof shouldShow === "function") {
    return (
      <Form.Item shouldUpdate noStyle>
        {({ getFieldsValue }) => {
          const values = getFieldsValue(true);
          const visible = shouldShow(values, form);
          if (!visible) return null;
          return inner;
        }}
      </Form.Item>
    );
  }

  return inner;
}
