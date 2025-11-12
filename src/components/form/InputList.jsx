import React, { useEffect, useState } from "react";
import { Input, Form, Space } from "antd";

function normalizeArray(len, arr) {
  const out = Array.from({ length: len }, (_, i) =>
    arr && Array.isArray(arr) ? arr[i] ?? "" : ""
  );
  return out;
}

function isEmpty(val) {
  return val === undefined || val === null || (typeof val === "string" && val.trim() === "");
}

function validateValueAgainstRule(rule, value, anyFilled) {
  if (!rule) return null;
  // required
  if (rule.required) {
    // If any one field is filled, others should not be required anymore
    if (!anyFilled && isEmpty(value)) return rule.message || "Required";
  }
  const str = value == null ? "" : String(value);
  // min/max length
  if (typeof rule.min === "number" && str.length < rule.min) {
    return rule.message || `Minimum ${rule.min} characters`;
  }
  if (typeof rule.max === "number" && str.length > rule.max) {
    return rule.message || `Maximum ${rule.max} characters`;
  }
  // type checks (basic)
  if (rule.type === "email" && !isEmpty(str)) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(str)) return rule.message || "Invalid email";
  }
  if (rule.type === "url" && !isEmpty(str)) {
    try {
      // eslint-disable-next-line no-new
      new URL(str);
    } catch (_) {
      return rule.message || "Invalid URL";
    }
  }
  if (rule.pattern && !isEmpty(str)) {
    const re = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
    if (!re.test(str)) return rule.message || "Invalid format";
  }
  // custom validator (sync only here); if async is needed parent rule should handle at Form.Item level
  if (typeof rule.validator === "function") {
    try {
      const res = rule.validator(rule, value);
      if (res && typeof res.then === "function") {
        // best-effort: treat unresolved as valid; parent Form.Item validator can be used for async
        // you can still return a rejected promise to bubble an error up here synchronously
        // but to keep component responsive we skip awaiting
      } else if (res === false) {
        return rule.message || "Invalid value";
      }
    } catch (e) {
      return rule.message || (e?.message ?? "Invalid value");
    }
  }
  return null;
}

const InputList = ({
  count = 3,
  value,
  onChange,
  placeholder = "Enter",
  size = "large",
  disabled,
  className,
  rules = [],
  ...rest
}) => {
  const values = normalizeArray(count, value);

  // touched state to control when to show errors (onBlur only)
  const [touched, setTouched] = useState(() => Array.from({ length: count }, () => false));
  // keep touched length in sync with count
  useEffect(() => {
    setTouched((prev) => {
      if (prev.length === count) return prev;
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? false);
      return next;
    });
  }, [count]);

  // whether any field is filled
  const anyFilled = values.some((v) => !isEmpty(v));

  const errors = values.map((v) => {
    for (const r of rules || []) {
      const err = validateValueAgainstRule(r, v, anyFilled);
      if (err) return err;
    }
    return null;
  });

  const handleChange = (idx, e) => {
    const newVal = e?.target ? e.target.value : e;
    const next = [...values];
    next[idx] = newVal;
    onChange?.(next.filter((v) => v !== ""));
  };

  const handleBlur = (idx) => {
    setTouched((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const phArray = Array.isArray(placeholder)
    ? placeholder
    : Array.from({ length: count }, (_, i) =>
        typeof placeholder === "string" ? `${placeholder}: ${i + 1}` : ""
      );

  return (
    <Space direction="vertical" className={className} style={{ width: "100%" }} size={8}>
      {values.map((val, idx) => (
        <Form.Item
          key={idx}
          validateStatus={touched[idx] && errors[idx] ? "error" : undefined}
          help={touched[idx] ? errors[idx] || undefined : undefined}
          style={{ marginBottom: 0 }}
          validateTrigger="onBlur"
          noStyle
        >
          <Input
            {...rest}
            size={size}
            disabled={disabled || (idx > 0 && isEmpty(values[idx - 1]))}
            placeholder={phArray[idx]}
            value={val}
            onChange={(e) => handleChange(idx, e)}
            onBlur={() => handleBlur(idx)}
          />
        </Form.Item>
      ))}
    </Space>
  );
};

export default InputList;
