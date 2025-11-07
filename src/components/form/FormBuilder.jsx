import React, { useEffect } from "react";
import { Form, Button, Space, Divider } from "antd";
import Field from "./Field";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import TableTitle from "../table/TableTitle";
import { defaultMaxFileUploadSize, defaultRequiredMsg } from "../../utils/constants";

/**
 * 🧩 FormBuilder Component
 *
 * Props:
 * @param {String} mode - "full" | "fields-only" (returns form instance and Fields component)
 * @param {String} formTitle - Title of the form
 * @param {String} formSubtitle - Subtitle of the form
 * @param {Array} formConfig - Array of field configs, e.g.:
 * [
 *   { name: 'title', label: 'Title', type: 'input', rules: [{ required: true }] },
 *   { name: 'type', label: 'Type', type: 'select', options: [{value:'e',label:'Election'}] },
 *   { name: 'dateRange', label: 'Date Range', type: 'daterange' },
 *   { name: 'attachment', label: 'Upload File', type: 'file' },
 * ]
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} onFinish - Submit handler
 * @param {Object} controlled - Optional controlled fields { fieldName: { value, onChange } }
 * @param {String} submitText - Submit button text
 * @param {Object} formProps - Extra props for AntD Form
 * @param {Boolean} twoColumn - Enable responsive 2-column layout
 */

export default function FormBuilder({
  mode = "full", // "full" | "fields-only"
  formTitle = "",
  formSubtitle = "",
  formConfig = [],
  initialValues = {},
  onFinish = () => {},
  layout = "vertical",
  controlled = {},
  submitText,
  cancelText = "Cancel",
  onCancel,
  formProps = {},
  twoColumn = true,
}) {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const isControlled = (name) =>
    controlled && Object.prototype.hasOwnProperty.call(controlled, name);

  const renderFieldType = (field, value, onChange) => {
    const placeholderMap = {
      select: `Select ${field.label}`,
      textarea: `Enter ${field.label}`,
      date: `Select ${field.label}`,
      daterange: [
        field.placeholder?.[0] || `Start ${field.label}`,
        field.placeholder?.[1] || `End ${field.label}`,
      ],
      time: `Select ${field.label}`,
      number: `Enter ${field.label}`,
      file: `Upload ${field.label}`,
      default: `Enter ${field.label}`,
    };

    const placeholder = field.placeholder || placeholderMap[field.type] || placeholderMap.default;
    const props = {
      className: "w-full",
      placeholder,
      value,
      onChange,
      options: field.options,
      rows: field.rows,
      accept: field.accept,
      multiple: field.multiple,
      datePickerProps: field.datePickerProps,
      uploadProps: {
        maxSize: defaultMaxFileUploadSize, // MB
        ...field.uploadProps,
      },
      selectProps: field.selectProps,
      render: field.render,
      fieldName: field.name,
      ...field,
    };

    return <Field type={field.type} disabled={mode === "view-only"} form={form} {...props} />;
  };

  const mapFieldToComponent = (field, fieldNamePath) => {
    if (isControlled(fieldNamePath)) {
      const c = controlled[fieldNamePath];
      const handleChange = (val) => {
        const newVal = val?.target ? val.target.value : val;
        c.onChange?.(newVal);
        form.setFieldsValue({ [fieldNamePath]: newVal });
      };

      return renderFieldType(field, c.value, handleChange);
    }

    return renderFieldType(field);
  };

  const handleFinish = (values) => {
    const controlledValues = Object.keys(controlled || {}).reduce((acc, key) => {
      acc[key] = controlled[key].value;
      return acc;
    }, {});

    onFinish({ ...values, ...controlledValues }, { form });
  };

  if (mode === "fields-only") {
    return {
      form,
      Fields: () => (
        <div className={`grid ${twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
          {formConfig.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules}
              valuePropName={field.valuePropName}
            >
              {mapFieldToComponent(field, field.name)}
            </Form.Item>
          ))}
        </div>
      ),
    };
  }

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={handleFinish}
      {...formProps}
      className="min-h-[calc(100vh-135px)] flex flex-col justify-between gap-6"
    >
      <div>
        {(formTitle || formSubtitle) && (
          <>
            <TableTitle title={formTitle} titleColor="text-black" subtitle={formSubtitle} />
            <Divider className="my-4" variant="dashed" />
          </>
        )}
        <div
          className={`grid ${
            twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          } gap-x-6  items-start`}
        >
          {formConfig.map((field) => {
            const processedRules = field.rules?.map((rule) => {
              if (rule.required && !rule.message) {
                const msgFn = defaultRequiredMsg[field.type] || defaultRequiredMsg.default;
                return { ...rule, message: msgFn(field.label) };
              }
              return rule;
            });

            return (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={processedRules}
                valuePropName={field.valuePropName}
                initialValue={field.initialValue}
                className="w-full"
              >
                {mapFieldToComponent(field, field.name)}
              </Form.Item>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        <CustomButton
          className="!px-10 ms-auto"
          text={cancelText}
          btnType="secondary"
          onClick={() => {
            onCancel ? onCancel?.() : navigate(-1);
          }}
          width=""
        />
        {(mode !== "view-only" || submitText) && (
          <CustomButton className="!px-10" htmlType="submit" text={submitText} width="" />
        )}
      </div>
    </Form>
  );
}
