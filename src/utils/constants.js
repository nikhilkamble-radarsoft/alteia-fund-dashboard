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
  phone: [
    { required: true, message: "Please enter above field." },
    {
      pattern: /^[0-9]{10}$/,
      message: "Please enter a valid 10-digit phone number.",
    },
  ],
  email: [
    { required: true, message: "Please enter above field." },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      message: "Please enter a valid email address.",
    },
  ],
  password: [
    { required: true, message: "Please enter above field." },
    { min: 8, message: "Password must be 8-20 characters." },
    { max: 20, message: "Password must be 8-20 characters." },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    },
  ],
  confirmPass: (key = "password") => [
    { required: true, message: "Please confirm password." },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue(key) === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Passwords do not match!"));
      },
    }),
  ],
  postalCode: [
    { required: true, message: "Please enter above field." },
    { pattern: /^[0-9]+$/, message: "Postal code must be a number." },
    { len: 6, message: "Postal code must be exactly 6 digits." },
  ],
};