import React, { useEffect, useState } from "react";
import { Form, Button, Space, Divider, Tabs, Badge } from "antd";
import Field, { FormField } from "./Field";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import TableTitle from "../table/TableTitle";
import { defaultMaxFileUploadSize, defaultRequiredMsg } from "../../utils/constants";
import { useTranslation } from "react-i18next";

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
 * @param {Boolean} multiLanguage - If true, renders English/Arabic tabs and requires both to be valid.
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
  loading = false,
  formHeight = "",
  multiLanguage = false,
}) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [activeLang, setActiveLang] = useState("en");
  const [tabErrors, setTabErrors] = useState({ en: false, ar: false });
  useEffect(() => {
    if (multiLanguage) {
      const errors = form.getFieldsError();
      const hasEnError = errors.some((e) => e.errors.length > 0 && e.name[0] === "en");
      const hasArError = errors.some((e) => e.errors.length > 0 && e.name[0] === "ar");
      setTabErrors({ en: hasEnError, ar: hasArError });
    }
  }, [form, multiLanguage]);

  useEffect(() => {
    const errors = form.getFieldsError().filter(({ errors }) => errors.length > 0);

    if (errors.length > 0) {
      const fieldNames = errors.map(({ name }) => name);
      form.validateFields(fieldNames);
    }
  }, [i18n.language, form]);

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
      // Handle nested paths for multi-lang
      if (Array.isArray(fieldNamePath)) {
        // Create a deep update or let AntD handle the path array
        form.setFieldsValue({ [fieldNamePath[0]]: { [fieldNamePath[1]]: newVal } });
      } else {
        form.setFieldsValue({ [fieldNamePath]: newVal });
      }
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
      handleChange,
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

  const renderFormItem = (field, itemProps = {}, langPrefix = null) => {
    const processedRules = getProcessedRules(field);

    // If multiLanguage is on, nested path is ['en', 'title']
    const fieldName = langPrefix ? [langPrefix, field.name] : field.name;
    const uniqueKey = langPrefix ? `${langPrefix}-${field.name}` : field.name;

    return (
      <FormField
        key={uniqueKey}
        name={fieldName}
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

  const onFinishFailed = ({ errorFields }) => {
    if (multiLanguage) {
      // 1. Calculate errors for both tabs immediately
      const hasEnError = errorFields.some((field) => field.name[0] === "en");
      const hasArError = errorFields.some((field) => field.name[0] === "ar");

      // 2. Update Red Dots state INSTANTLY (Fixes the delay)
      setTabErrors({ en: hasEnError, ar: hasArError });

      // 3. Smart Switching Logic:
      // Only switch tabs if the CURRENT tab is valid (clean),
      // but the OTHER tab has errors.
      const currentTabHasErrors =
        (activeLang === "en" && hasEnError) || (activeLang === "ar" && hasArError);

      if (!currentTabHasErrors) {
        if (hasEnError) setActiveLang("en");
        else if (hasArError) setActiveLang("ar");
      }
      // If current tab has errors, we stay here so the user can fix them first.
    }
  };

  const renderGrid = (langPrefix) => (
    <div
      className={`grid ${
        twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      } gap-x-4 items-start`}
    >
      {formConfig.map((field) =>
        renderFormItem(
          field,
          {
            initialValue: field.initialValue,
            className: "w-full",
            validateTrigger: "onBlur",
            ...field.formItemProps,
          },
          langPrefix,
        ),
      )}
    </div>
  );

  if (mode === "fields-only") {
    return {
      form,
      Fields: renderGrid(),
    };
  }

  const currentLangLabel =
    activeLang === "en" ? t("language.english", "English") : t("language.arabic", "Arabic");

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={handleFinish}
      onFinishFailed={onFinishFailed}
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
        {multiLanguage ? (
          <Tabs
            activeKey={activeLang}
            onChange={setActiveLang}
            type="card"
            tabBarExtraContent={
              <span className="text-gray-500 text-sm">
                {t("common.filling_form_msg", { ns: "form", lang: currentLangLabel })}
              </span>
            }
            destroyOnHidden={false} // IMPORTANT: Keep hidden fields mounted so they validate
            items={[
              {
                key: "en",
                label: (
                  <Badge dot={tabErrors.en} offset={[5, 0]}>
                    {t("language.english", "English")}
                  </Badge>
                ),
                children: renderGrid("en"),
              },
              {
                key: "ar",
                label: (
                  <Badge dot={tabErrors.ar} offset={[5, 0]}>
                    {t("language.arabic", "Arabic")}
                  </Badge>
                ),
                children: renderGrid("ar"),
              },
            ]}
          />
        ) : (
          renderGrid(null) // Standard render
        )}
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
