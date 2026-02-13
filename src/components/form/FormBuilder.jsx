import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Form, Divider, Tabs, Badge } from "antd";
import Field, { FormField } from "./Field";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import TableTitle from "../table/TableTitle";
import { defaultMaxFileUploadSize, defaultRequiredMsg } from "../../utils/constants";
import { useTranslation } from "react-i18next";
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
  multiLanguage = { showExtra: true },
}) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { callApi } = useApi();

  const [activeLang, setActiveLang] = useState("en");
  const [tabErrors, setTabErrors] = useState({ en: false, ar: false });
  const [translating, setTranslating] = useState(false);

  // Stringify dependencies to prevent infinite loops if parent passes new object references
  const initialValuesJson = JSON.stringify(initialValues);
  const multiLanguageJson = JSON.stringify(multiLanguage);

  const translateBatch = async (texts, targetLang) => {
    if (!texts.length) return [];
    return []; // TODO: Uncomment to disable translation for testing

    const sourceLang = targetLang === "ar" ? "en" : "ar";

    const { response, status } = await callApi({
      url: "/translate",
      method: "post",
      data: {
        texts: texts,
        targetLang: targetLang,
        sourceLang: sourceLang,
      },
      errorOptions: {},
    });

    if (status && response?.data) {
      return response.data;
    }

    return texts;
  };

  const updateTabErrors = useCallback(() => {
    if (!multiLanguage) return;
    const errors = form.getFieldsError();
    const hasEnError = errors.some((e) => e.errors.length > 0 && e.name[0] === "en");
    const hasArError = errors.some((e) => e.errors.length > 0 && e.name[0] === "ar");

    setTabErrors((prev) => {
      // optimization: prevent re-render if state hasn't changed
      if (prev.en === hasEnError && prev.ar === hasArError) return prev;
      return { en: hasEnError, ar: hasArError };
    });
  }, [form, multiLanguage]);

  const handleTabChange = async (newLang) => {
    if (translating) return;

    const oldLang = activeLang;
    setActiveLang(newLang);

    const currentValues = form.getFieldsValue();
    const sourceData = currentValues[oldLang] || {};
    const targetData = currentValues[newLang] || {};

    // We flatten all data into a single array of strings for the API
    const textsToTranslate = [];
    // We use this map to reconstruct the structure (string vs array) later
    const fieldMap = []; // { name: string, type: 'string' | 'list', count: number }

    formConfig.forEach((field) => {
      // --- Case 1: Standard Text Input ---
      if (field.type === "input" || field.type === "textarea") {
        const sourceVal = sourceData[field.name];
        const targetVal =
          targetData[field.name] ||
          (initialValues && initialValues[newLang] ? initialValues[newLang][field.name] : null);

        if (sourceVal && !targetVal) {
          textsToTranslate.push(sourceVal);
          fieldMap.push({ name: field.name, type: "string", count: 1 });
        }
      }

      // --- Case 2: Input List (Array of Strings) ---
      if (field.type === "input-list") {
        const sourceVal = sourceData[field.name]; // e.g. ["Apple", "Banana"]
        const targetVal =
          targetData[field.name] ||
          (initialValues && initialValues[newLang] ? initialValues[newLang][field.name] : []);

        // Only translate if source has items and target is empty
        if (
          Array.isArray(sourceVal) &&
          sourceVal.length > 0 &&
          (!targetVal || targetVal.length === 0)
        ) {
          // Push ALL list items to the flat array
          textsToTranslate.push(...sourceVal);
          // Record that the next X items belong to this field
          fieldMap.push({ name: field.name, type: "list", count: sourceVal.length });
        }
      }
    });

    if (textsToTranslate.length > 0) {
      setTranslating(true);

      // Send flat array to API
      const translatedFlatValues = await translateBatch(textsToTranslate, newLang);

      const updates = {};
      let currentIndex = 0;

      // Reconstruct the data structure
      fieldMap.forEach(({ name, type, count }) => {
        if (type === "string") {
          // Take 1 string
          updates[name] = translatedFlatValues[currentIndex];
          currentIndex++;
        } else if (type === "list") {
          // Take 'count' strings and form an array
          updates[name] = translatedFlatValues.slice(currentIndex, currentIndex + count);
          currentIndex += count;
        }
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

  // --- Effects ---

  // 1. Handle Tab Error Initialization (Protected against infinite loop)
  useEffect(() => {
    if (multiLanguage) {
      updateTabErrors();
    }
  }, [updateTabErrors, multiLanguageJson]); // Uses stringified dependency

  // 2. Handle Initial Values (Protected against infinite loop)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length) {
      form.setFieldsValue(initialValues);
    }
    computeAndSetComputedFields();
  }, [initialValuesJson, form]);

  // 3. Handle Auto-validation on language change
  useEffect(() => {
    const errors = form.getFieldsError().filter(({ errors }) => errors.length > 0);
    if (errors.length > 0) {
      const fieldNames = errors.map(({ name }) => name);
      form.validateFields(fieldNames);
    }
  }, [i18n.language, form]);

  // --- Logic ---

  const computeAndSetComputedFields = (changedName) => {
    // 1. Get raw nested values: { en: { fund_id: 1, ... }, ar: { ... } }
    const rawValues = form.getFieldsValue(true);

    // 2. Flatten values for easier access in computed functions
    // Priority: Root properties > English properties > Arabic properties
    const flatValues = {
      ...rawValues.en, // English fields (fund_id, etc.)
      ...rawValues.ar, // Arabic fields
      ...rawValues, // Root fields (if any)
    };

    const updates = {};

    formConfig.forEach((f) => {
      if (typeof f.computed === "function") {
        if (Array.isArray(f.computedDeps) && changedName) {
          const changedFieldName = Array.isArray(changedName)
            ? changedName[changedName.length - 1]
            : changedName;
          if (!f.computedDeps.includes(changedFieldName)) return;
        }

        try {
          const v = f.computed(flatValues);

          const targetPath = multiLanguage ? ["en", f.name] : f.name;

          const currentVal = form.getFieldValue(targetPath);

          if (v !== undefined && v !== currentVal) {
            form.setFieldValue(targetPath, v);
          }
        } catch (e) {
          console.error("Computation Error:", e);
        }
      }
    });
  };

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
        maxSize: defaultMaxFileUploadSize,
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
        loading={loading || translating}
      />
    );
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

    // Uncontrolled (AntD native)
    const currentValue = form.getFieldValue(fieldNamePath);

    // We create a wrapper to hook into changes for computed fields
    const handleChange = (val) => {
      const newVal = val?.target ? val.target.value : val;
      // Note: We don't need to manually setFieldsValue for uncontrolled inputs usually,
      // but if we do it for computed fields logic, we must be careful.
      // Ideally, we rely on onValuesChange from the Form, but this works for per-field logic.
      if (Array.isArray(fieldNamePath)) {
        form.setFieldsValue({
          [fieldNamePath[0]]: { [fieldNamePath[1]]: newVal },
        });
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
      {
        ...field,
        disabled: field.disabled ?? typeof field.computed === "function",
      },
      computedValue,
      handleChange,
    );
  };

  const renderFormItem = (field, itemProps = {}, langPrefix = null) => {
    // Process rules inside render to ensure access to latest context if needed
    const processedRules = field.rules?.map((rule) => {
      if (rule.required && !rule.message) {
        const msgFn = defaultRequiredMsg[field.type] || defaultRequiredMsg.default;
        return { ...rule, message: msgFn(field.label) };
      }
      return rule;
    });

    const fieldName = langPrefix ? [langPrefix, field.name] : field.name;
    const uniqueKey = langPrefix ? `${langPrefix}-${field.name}` : field.name;

    const dependencies = field.dependencies?.map((dep) => (langPrefix ? [langPrefix, dep] : dep));

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
        dependencies={dependencies}
      >
        {mapFieldToComponent(field, fieldName)}
      </FormField>
    );
  };

  // Memoize the grid rendering to improve performance during tab switching
  const renderGrid = (langPrefix) => (
    <div
      className={`grid ${
        twoColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      } gap-x-4 items-start`}
    >
      {formConfig.map((field) => {
        // --- LOGIC START: Hide non-text fields in secondary languages ---
        if (langPrefix && langPrefix !== "en") {
          const allowedTypes = ["input", "textarea", "input-list"]; // Define allowed types for translations
          if (!allowedTypes.includes(field.type)) {
            return null;
          } else if (field.hideFromOtherLanguages) {
            return null;
          }
        }
        // --- LOGIC END ---

        return renderFormItem(
          field,
          {
            initialValue: field.initialValue,
            className: "w-full",
            validateTrigger: "onBlur",
            ...field.formItemProps,
          },
          langPrefix,
        );
      })}
    </div>
  );

  // Memoize the actual grid components so they don't re-compute on every tick
  const englishGrid = useMemo(() => renderGrid("en"), [formConfig, twoColumn]);
  const arabicGrid = useMemo(() => renderGrid("ar"), [formConfig, twoColumn]);
  const defaultGrid = useMemo(() => renderGrid(null), [formConfig, twoColumn]);

  const handleFinish = (values) => {
    const controlledValues = Object.keys(controlled || {}).reduce((acc, key) => {
      acc[key] = controlled[key].value;
      return acc;
    }, {});
    onFinish({ ...values, ...controlledValues }, { form });
  };

  const onFinishFailed = ({ errorFields }) => {
    if (multiLanguage) {
      updateTabErrors(); // Utilize the shared function

      const hasEnError = errorFields.some((field) => field.name[0] === "en");
      const hasArError = errorFields.some((field) => field.name[0] === "ar");

      // Auto-switch tab to error
      const currentTabHasErrors =
        (activeLang === "en" && hasEnError) || (activeLang === "ar" && hasArError);

      if (!currentTabHasErrors) {
        if (hasEnError) setActiveLang("en");
        else if (hasArError) setActiveLang("ar");
      }
    }
  };

  if (mode === "fields-only") {
    return {
      form,
      Fields: defaultGrid,
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
      // Add onFieldsChange to update badges in real-time without polling/effects
      onFieldsChange={() => {
        if (multiLanguage) updateTabErrors();
      }}
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
              multiLanguage.showExtra && (
                <span className="text-gray-500 text-sm">
                  {t("common.filling_form_msg", {
                    ns: "form",
                    lang: currentLangLabel,
                  })}
                </span>
              )
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
                children: englishGrid, // Use memoized grid
                forceRender: true,
              },
              {
                key: "ar",
                label: (
                  <Badge dot={tabErrors.ar} offset={[5, 0]}>
                    {t("language.arabic", "Arabic")}
                  </Badge>
                ),
                children: arabicGrid, // Use memoized grid
                forceRender: true,
              },
            ]}
          />
        ) : (
          defaultGrid
        )}
      </div>

      <div
        className={`flex flex-wrap gap-2 w-full ${twoColumn ? "justify-end" : "justify-center"}`}
      >
        <CustomButton
          className={`!px-10 ${twoColumn ? "" : "flex-1"}`}
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
            className={`!px-10 ${twoColumn ? "" : "flex-1"}`}
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
