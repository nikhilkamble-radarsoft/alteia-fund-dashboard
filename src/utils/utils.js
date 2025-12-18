import dayjs from "dayjs";

/**
 * Flexible date formatter
 * @param {string|Date|number} date - Input date
 * @param {object} options - Options
 * @param {string} options.inputFormat - Format of the input date (optional)
 * @param {string} options.outputFormat - Desired output format (default: "DD/MM/YYYY")
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  const { inputFormat, outputFormat = "DD/MM/YYYY" } = options;
  if (!date) return "";

  return inputFormat
    ? dayjs(date, inputFormat).format(outputFormat)
    : dayjs(date).format(outputFormat);
};

/**
 * Flexible time formatter
 * @param {number} seconds - Total time in seconds
 * @param {object} options - Options
 * @param {boolean} [options.showHours=false] - Whether to include hours if available
 * @returns {string} Formatted time string (e.g. "05:23" or "01:05:23")
 */
export const formatTime = (seconds, { showHours = false } = {}) => {
  if (seconds == null || isNaN(seconds)) return "00:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formatted = [
    showHours ? hrs.toString().padStart(2, "0") : null,
    mins.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");

  return formatted;
};

export const inputFormatters = {
  money: {
    formatter: (value) => {
      if (value === undefined || value === "") return "";
      const [intRaw, decRaw] = String(value).split(".");
      const intFmt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `$ ${intFmt}${decRaw !== undefined ? `.${decRaw}` : ""}`;
    },
    parser: (val) => (val ? val.replace(/\$\s?|,/g, "") : ""),
    precision: 2,
    min: 0,
    max: 100_000_000_000,
    step: 1000,
  },
};

export const checkUserKycDocument = (user) => {
  if (!user) return false;
  return user.document_file && user.address_file && user.signature_file;
};

/**
 * Sanitize text into human-readable format
 *
 * Examples:
 *  close-ended        => "Close Ended"
 *  close_ended        => "Close Ended"
 *  closeEnded         => "Close Ended"
 *  CLOSE_ENDED        => "Close Ended"
 *
 * @param {string} text
 * @param {object} options
 * @param {boolean} options.capitalizeFirst   Capitalize only first letter
 * @param {boolean} options.capitalizeWords   Capitalize each word (default)
 * @param {boolean} options.lowercase         Force lowercase
 * @param {boolean} options.uppercase         Force uppercase
 * @param {string}  options.separator         Custom separator (default: space)
 * @param {object}  options.acronyms          Preserve acronyms (e.g. { id: "ID" })
 *
 * @returns {string}
 */
export const sanitizeText = (text, options = {}) => {
  if (!text || typeof text !== "string") return "";

  const {
    capitalizeFirst = false,
    capitalizeWords = true,
    lowercase = false,
    uppercase = false,
    separator = " ",
    acronyms = {},
  } = options;

  let result = text
    // Replace separators with space
    .replace(/[_\-]+/g, " ")

    // Split camelCase / PascalCase
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")

    // Normalize spaces
    .replace(/\s+/g, " ")
    .trim();

  // Apply casing rules
  if (uppercase) {
    result = result.toUpperCase();
  } else if (lowercase) {
    result = result.toLowerCase();
  } else {
    result = result.toLowerCase();

    if (capitalizeWords) {
      result = result.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (capitalizeFirst) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
  }

  // Apply acronym overrides
  if (Object.keys(acronyms).length) {
    result = result
      .split(" ")
      .map((word) => acronyms[word.toLowerCase()] || word)
      .join(separator);
  } else {
    result = result.split(" ").join(separator);
  }

  return result;
};
