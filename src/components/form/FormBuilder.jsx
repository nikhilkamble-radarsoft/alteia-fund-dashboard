import React, { useEffect, useState } from "react";
import { Form, Divider, Tabs, Badge } from "antd";
import Field, { FormField } from "./Field";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import TableTitle from "../table/TableTitle";
import { defaultMaxFileUploadSize, defaultRequiredMsg } from "../../utils/constants";
import { useTranslation } from "react-i18next";
import axios from "axios";
import useApi from "../../logic/useApi";

export default function FormBuilder({
  mode = "full",
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
  const { callApi } = useApi();

  const [activeLang, setActiveLang] = useState("en");
  const [tabErrors, setTabErrors] = useState({ en: false, ar: false });
  const [translating, setTranslating] = useState(false);

  const translateBatch = async (texts, targetLang) => {
    if (!texts.length) return [];

    const { response, status } = await callApi({
      url: "/translate",
      method: "post",
      data: {
        texts: texts,
        targetLang: targetLang,
      },
      errorOptions: {},
    });

    if (status && response?.data) {
      return response.data;
    }

    return texts;
  };

  const handleTabChange = async (newLang) => {
    if (translating) return;

    const oldLang = activeLang;
    setActiveLang(newLang); // Switch tab immediately for better UX

    // Identify fields to translate
    const currentValues = form.getFieldsValue();
    const sourceData = currentValues[oldLang] || {};
    const targetData = currentValues[newLang] || {};

    const fieldsToTranslate = [];
    const valuesToTranslate = [];

    formConfig.forEach((field) => {
      // Only translate inputs that have a value in source and are EMPTY in target
      if (field.type === "input") {
        const sourceVal = sourceData[field.name];
        const targetVal = targetData[field.name];

        if (sourceVal && !targetVal) {
          fieldsToTranslate.push(field.name);
          valuesToTranslate.push(sourceVal);
        }
      }
    });

    if (fieldsToTranslate.length > 0) {
      setTranslating(true);
      const translatedValues = await translateBatch(valuesToTranslate, newLang);

      const updates = {};
      fieldsToTranslate.forEach((fieldName, index) => {
        updates[fieldName] = translatedValues[index];
      });

      form.setFieldsValue({
        [newLang]: {
          ...targetData,
          ...updates,
        },
      });
      setTranslating(false);
    }
  };

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
    computeAndSetComputedFields();
  }, [initialValues, form]);

  const isControlled = (name) =>
    controlled && Object.prototype.hasOwnProperty.call(controlled, name);

  const renderFieldType = (field, value, onChange) => {
    const tPh = (key) => t(`common.placeholders.${key}`, { ns: "form", label: field.label });

    const placeholderMap = {
      select: tPh("select"),
      time: tPh("select"),
      date: tPh("select"),
      textarea: tPh("enter"),
      number: tPh("enter"),
      file: tPh("upload"),
      default: tPh("enter"),

      daterange: [field.placeholder?.[0] || tPh("start"), field.placeholder?.[1] || tPh("end")],
    };

    const placeholder = field.placeholder || placeholderMap[field.type] || placeholderMap.default;
    const props = {
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
        loading={loading || translating} // Show loading state during translation
      />
    );
  };

  const computeAndSetComputedFields = (changedName) => {
    const values = form.getFieldsValue(true);
    const updates = {};
    formConfig.forEach((f) => {
      if (typeof f.computed === "function") {
        if (Array.isArray(f.computedDeps) && changedName) {
          if (!f.computedDeps.includes(changedName)) return;
        }
        try {
          const v = f.computed(values);
          if (v !== undefined && v !== null && v !== values[f.name]) {
            updates[f.name] = v;
          }
        } catch (e) {}
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

    const currentValue = form.getFieldValue(fieldNamePath);
    const handleChange = (val) => {
      const newVal = val?.target ? val.target.value : val;
      if (Array.isArray(fieldNamePath)) {
        form.setFieldsValue({ [fieldNamePath[0]]: { [fieldNamePath[1]]: newVal } });
      } else {
        form.setFieldsValue({ [fieldNamePath]: newVal });
      }
      computeAndSetComputedFields(fieldNamePath);
    };

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
      const hasEnError = errorFields.some((field) => field.name[0] === "en");
      const hasArError = errorFields.some((field) => field.name[0] === "ar");

      setTabErrors({ en: hasEnError, ar: hasArError });

      const currentTabHasErrors =
        (activeLang === "en" && hasEnError) || (activeLang === "ar" && hasArError);

      if (!currentTabHasErrors) {
        if (hasEnError) setActiveLang("en");
        else if (hasArError) setActiveLang("ar");
      }
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
            onChange={handleTabChange}
            type="card"
            tabBarExtraContent={
              <span className="text-gray-500 text-sm">
                {t("common.filling_form_msg", { ns: "form", lang: currentLangLabel })}
              </span>
            }
            destroyOnHidden={false}
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
          renderGrid(null)
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
          loading={loading || translating}
        />
        {(mode !== "view-only" || submitText) && (
          <CustomButton
            className="!px-10"
            htmlType="submit"
            text={submitText}
            width=""
            loading={loading || translating}
          />
        )}
      </div>
    </Form>
  );
}
