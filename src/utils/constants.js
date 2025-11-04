export const votingDurationSeconds = 600; // 10 minutes
export const minPasswordLength = 6;
export const localStorageTokenKey = "token";

export const defaultRequiredMsg = {
  file: (label) => `Please upload ${label}`,
  select: (label) => `Please select ${label}`,
  daterange: (label) => `Please select ${label}`,
  date: (label) => `Please select ${label}`,
  textarea: (label) => `Please enter ${label}`,
  number: (label) => `Please enter ${label}`,
  default: (label) => `Please enter ${label}`,
};

export const formRules = {
  required: (label, type = "default", customMsg) => {
    const message = customMsg || (defaultRequiredMsg[type] || defaultRequiredMsg.default)(label);
    return [{ required: true, message }];
  },
  phone: (required = true, requiredMsg = "Please enter phone number.") => [
    ...(required ? [{ required: true, message: requiredMsg }] : []),
    {
      pattern: /^[0-9]{10}$/,
      message: "Please enter a valid 10-digit phone number.",
    },
  ],

  email: (required = true, requiredMsg = "Please enter email.") => [
    ...(required ? [{ required: true, message: requiredMsg }] : []),
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: "Please enter a valid email address.",
    },
  ],

  password: (required = true, requiredMsg = "Please enter password.") => [
    ...(required ? [{ required: true, message: requiredMsg }] : []),
    { min: 8, message: "Password must be 8-20 characters." },
    { max: 20, message: "Password must be 8-20 characters." },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message: "Password must contain uppercase, lowercase, number, and special character.",
    },
  ],

  confirmPass: (key = "password", required = true, requiredMsg = "Please confirm password.") => [
    ...(required ? [{ required: true, message: requiredMsg }] : []),
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
    ...(required ? [{ required: true, message: requiredMsg }] : []),
    { pattern: /^[0-9]+$/, message: "Postal code must be a number." },
    { len: 6, message: "Postal code must be exactly 6 digits." },
  ],
};
