import i18n from "../logic/i18n"; // Adjust path if needed

export const localStorageTokenKey = "token";
export const defaultMaxFileUploadSize = 5;
export const tableFallbackText = "-";

// Helper to shorten the call
const tLabel = (key, options) => i18n.t(`field.${key}`, { ns: "form", ...options });
const tVal = (key, options) => i18n.t(`validation.${key}`, { ns: "form", ...options });

export const defaultRequiredMsg = {
  file: (label) => tVal("required_upload", { label }),
  select: (label) => tVal("required_select", { label }),
  daterange: (label) => tVal("required_select", { label }),
  date: (label) => tVal("required_select", { label }),
  textarea: (label) => tVal("required", { label }),
  number: (label) => tVal("required", { label }),
  default: (label) => tVal("required", { label }),
};

const requiredRule = true;

export const formRules = {
  required: (label, type = "default", customMsg) => {
    const message = customMsg || (defaultRequiredMsg[type] || defaultRequiredMsg.default)(label);
    return [{ required: requiredRule, message }];
  },

  phone: (required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("phone") }),
          },
        ]
      : []),
    {
      pattern: /^[0-9]{4,17}$/,
      message: tVal("phone_invalid"),
    },
  ],

  email: (required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("email") }),
          },
        ]
      : []),
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: tVal("email_invalid"),
    },
  ],

  url: (required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("url") }),
          },
        ]
      : []),
    {
      pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i,
      message: tVal("url_invalid"),
    },
  ],

  password: (required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("password") }),
          },
        ]
      : []),
    { min: 8, message: tVal("password_length") },
    { max: 20, message: tVal("password_length") },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message: tVal("password_complexity"),
    },
  ],

  confirmPass: (key = "password", required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("password") }),
          },
        ]
      : []),
    ({ getFieldValue }) => ({
      validator(_, value) {
        let targetValue = getFieldValue(key);

        if (targetValue === undefined) {
          targetValue = getFieldValue(["en", key]);
        }

        if (!value || targetValue === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error(tVal("password_match")));
      },
    }),
  ],

  postalCode: (required = true, requiredMsg) => [
    ...(required
      ? [
          {
            required: requiredRule,
            message: requiredMsg || tVal("required", { label: tLabel("postal_code") }),
          },
        ]
      : []),
    { pattern: /^[0-9]+$/, message: tVal("postal_number") },
  ],
};

// ... keep exports for investorKycStatus, tradeStatus, etc. ...
export const investorKycStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

export const tradeStatus = {
  active: "active",
  upcoming: "upcoming",
  inactive: "inactive",
};

export const tradeInterestStatus = {
  new: "new",
  contacted: "contacted",
  reminder_set: "followup",
  missed_reminder: "missed_reminder",
};

export const fundPurchaseStatus = {
  completed: "completed",
  pending: "pending",
  in_progress: "in_progress",
  cancelled: "cancelled",
};

export const inProdMode = import.meta.env.VITE_ENV !== "development";
