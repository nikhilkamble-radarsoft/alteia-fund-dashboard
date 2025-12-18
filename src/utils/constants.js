export const localStorageTokenKey = "token";
export const defaultMaxFileUploadSize = 5; // in MB

export const defaultRequiredMsg = {
  file: (label) => `Please upload ${label}`,
  select: (label) => `Please select ${label}`,
  daterange: (label) => `Please select ${label}`,
  date: (label) => `Please select ${label}`,
  textarea: (label) => `Please enter ${label}`,
  number: (label) => `Please enter ${label}`,
  default: (label) => `Please enter ${label}`,
};

const requiredRule = true;

export const formRules = {
  required: (label, type = "default", customMsg) => {
    const message = customMsg || (defaultRequiredMsg[type] || defaultRequiredMsg.default)(label);
    return [{ required: requiredRule, message }];
  },
  phone: (required = true, requiredMsg = "Please enter phone number.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    {
      pattern: /^[0-9]{4,17}$/,
      message: "Please enter a valid phone number.",
    },
  ],

  email: (required = true, requiredMsg = "Please enter email.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: "Please enter a valid email address.",
    },
  ],

  url: (required = true, requiredMsg = "Please enter URL.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    {
      pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i,
      message: "Please enter a valid URL.",
    },
  ],

  password: (required = true, requiredMsg = "Please enter password.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    { min: 8, message: "Password must be 8-20 characters." },
    { max: 20, message: "Password must be 8-20 characters." },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message: "Password must contain uppercase, lowercase, number, and special character.",
    },
  ],

  confirmPass: (key = "password", required = true, requiredMsg = "Please confirm password.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue(key) === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Passwords do not match!"));
      },
    }),
  ],

  postalCode: (required = true, requiredMsg = "Please enter postal code.") => [
    ...(required ? [{ required: requiredRule, message: requiredMsg }] : []),
    { pattern: /^[0-9]+$/, message: "Postal code must be a number." },
    // { len: 6, message: "Postal code must be exactly 6 digits." },
  ],
};

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
