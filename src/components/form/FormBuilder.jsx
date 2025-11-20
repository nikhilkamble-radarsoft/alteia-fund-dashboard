import React, { useEffect } from "react";
import { Form, Button, Space, Divider } from "antd";
import Field, { FormField } from "./Field";
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
  onFinish = () => { },
  layout = "vertical",
  controlled = {},
  submitText,
  cancelText = "Cancel",
  onCancel,
  formProps = {},
  twoColumn = true,
  loading = false,
  formHeight = "min-h-[calc(100vh-135px)]",
}) {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length) {
      form.setFieldsValue(initialValues);
    }
    // initialize computed fields after initial values load
    // compute all computed fields once on mount/initial change
    computeAndSetComputedFields();
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
      // spread user field props first so our controlled props override
      ...field,
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
    };

    return (
      <Field
        type={field.type}
        form={form}
        {...props}
        disabled={mode === "view-only" || field.disabled}
        loading={loading}
      />
    );
  };

  const computeAndSetComputedFields = (changedName) => {
    const values = form.getFieldsValue(true);
    const updates = {};
    formConfig.forEach((f) => {
      if (typeof f.computed === "function") {
        // if deps specified, only recompute when a dep changes
        if (Array.isArray(f.computedDeps) && changedName) {
          if (!f.computedDeps.includes(changedName)) return;
        }
        try {
          const v = f.computed(values);
          if (v !== undefined && v !== null && v !== values[f.name]) {
            updates[f.name] = v;
          }
        } catch (e) {
          // ignore compute errors silently
        }
      }
    });
    if (Object.keys(updates).length) {
      form.setFieldsValue(updates);
    }
  };

  const mapFieldToComponent = (field, fieldNamePath) => {
    if (isControlled(fieldNamePath)) {
      const c = controlled[fieldNamePath];
      const handleChange = (val) => {
        const newVal = val?.target ? val.target.value : val;
        c.onChange?.(newVal);
        form.setFieldsValue({ [fieldNamePath]: newVal });
        computeAndSetComputedFields(fieldNamePath);
      };

      return renderFieldType(field, c.value, handleChange);
    }

    // default: wire field to form value/onChange so it's controlled by the form
    const currentValue = form.getFieldValue(fieldNamePath);
    const handleChange = (val) => {
      const newVal = val?.target ? val.target.value : val;
      form.setFieldsValue({ [fieldNamePath]: newVal });
      computeAndSetComputedFields(fieldNamePath);
    };

    // if field has computed function, make it read-only by default
    const computedValue =
      typeof field.computed === "function"
        ? field.computed(form.getFieldsValue(true))
        : currentValue;

    return renderFieldType(
      { ...field, disabled: field.disabled ?? typeof field.computed === "function" },
      computedValue,
      handleChange
    );
  };

  const getProcessedRules = (field) =>
    field.rules?.map((rule) => {
      if (rule.required && !rule.message) {
        const msgFn = defaultRequiredMsg[field.type] || defaultRequiredMsg.default;
        return { ...rule, message: msgFn(field.label) };
      }
      return rule;
    });

  const renderFormItem = (field, itemProps = {}) => {
    const processedRules = getProcessedRules(field);

    return (
      <FormField
        key={field.name}
        name={field.name}
        label={field.label}
        type={field.type}
        rules={processedRules}
        valuePropName={field.valuePropName}
        formItemProps={itemProps}
        form={form}
        shouldShow={field.shouldShow}
      >
        {mapFieldToComponent(field, field.name)}
      </FormField>
    );
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
      Fields: (
        <div className={`grid ${twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6`}>
          {formConfig.map((field) => renderFormItem(field))}
        </div>
      ),
    };
  }

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={handleFinish}
      className={`${formHeight} flex flex-col justify-between gap-6`}
      {...formProps}
    >
      <div>
        {(formTitle || formSubtitle) && (
          <>
            <TableTitle title={formTitle} titleColor="text-black" subtitle={formSubtitle} />
            <Divider className="my-4" variant="dashed" />
          </>
        )}
        <div
          className={`grid ${twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            } gap-x-4  items-start`}
        >
          {formConfig.map((field) =>
            renderFormItem(field, {
              initialValue: field.initialValue,
              className: "w-full",
              validateTrigger: "onBlur",
              ...field.formItemProps,
            })
          )}
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
          loading={loading}
        />
        {(mode !== "view-only" || submitText) && (
          <CustomButton
            className="!px-10"
            htmlType="submit"
            text={submitText}
            width=""
            loading={loading}
          />
        )}
      </div>
    </Form>
  );
}
