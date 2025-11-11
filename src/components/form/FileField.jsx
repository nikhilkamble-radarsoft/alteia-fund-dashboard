// src/components/form/FileField.jsx
import React, { useEffect } from "react";
import { Upload, Form, Alert, Spin } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { useMediaQuery } from "react-responsive";
import { LuPlus } from "react-icons/lu";
import { PiUploadFill } from "react-icons/pi";
import clsx from "clsx";
import CustomBadge from "../common/CustomBadge";
import CustomButton from "./CustomButton";

export default function FileField({
  className = "w-full",
  placeholder = "Upload",
  value,
  onChange,
  accept,
  multiple = false,
  uploadProps = {},
  form,
  fieldName,
  disabled: disabledProp,
  hidden: hiddenProp,
  loading = false,
}) {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [internalList, setInternalList] = React.useState([]);
  const { showView = true, showDownload = false } = uploadProps;

  // Sync external value (AWS URLs) with internal list
  useEffect(() => {
    const normalizedValue = typeof value === "string" ? [value] : value;

    if (normalizedValue && Array.isArray(normalizedValue)) {
      const hasRemoteUrls = normalizedValue.some(
        (item) =>
          typeof item === "string" || (typeof item === "object" && item.url && !item.originFileObj)
      );

      if (hasRemoteUrls) {
        const remoteFiles = normalizedValue
          .filter(
            (item) => typeof item === "string" || (typeof item === "object" && !item.originFileObj)
          )
          .map((item, index) => {
            const url = typeof item === "string" ? item : item.url;
            const fileName =
              typeof item === "string"
                ? url.split("/").pop()?.split("?")[0] || `File ${index + 1}`
                : item.name || url.split("/").pop()?.split("?")[0] || `File ${index + 1}`;

            return {
              uid: `url-${index}-${Date.now()}`,
              name: fileName,
              status: "done",
              url: url,
              isRemote: true,
            };
          });

        const existingLocalFiles = internalList.filter((f) => !f.isRemote && f.originFileObj);
        setInternalList([...remoteFiles, ...existingLocalFiles]);
      } else {
        setInternalList(normalizedValue);
      }
    } else if (normalizedValue && Array.isArray(normalizedValue) && normalizedValue.length === 0) {
      setInternalList([]);
    }
  }, [value]);

  const handleChange = ({ fileList }) => {
    let list = multiple ? fileList : fileList.slice(-1);
    setInternalList(list);
    onChange?.(list);

    if (form && fieldName) {
      form.setFields([{ name: fieldName, errors: [] }]);
    }
  };

  const { status } = Form.Item.useStatus?.() ?? {};
  const isError = status === "error";

  const getFileUrl = (file) => {
    if (file.isRemote && file.url) return file.url;
    if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
    return file.url || file.thumbUrl;
  };

  const getFileName = (file) => file.name || "Unknown File";

  const computedDisabled = Boolean(loading || disabledProp);
  const showUploadInput =
    !hiddenProp && !computedDisabled && (multiple || internalList.length === 0);

  return (
    <div className="relative space-y-2">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg">
          <Spin size="small" />
        </div>
      )}

      {showUploadInput && (
        <Upload
          accept={accept}
          multiple={multiple}
          fileList={internalList.filter((f) => !f.isRemote)}
          onChange={handleChange}
          showUploadList={false}
          disabled={computedDisabled}
          beforeUpload={(file, fileListArg) => {
            const maxSize = uploadProps?.maxSize;
            if (maxSize && file && file.size / 1024 / 1024 > Number(maxSize)) {
              if (form && fieldName) {
                form.setFields([
                  { name: fieldName, errors: [`File must be smaller than ${maxSize}MB`] },
                ]);
              }
              return Upload.LIST_IGNORE;
            }
            if (form && fieldName) {
              form.setFields([{ name: fieldName, errors: [] }]);
            }
            if (typeof uploadProps.beforeUpload === "function") {
              return uploadProps.beforeUpload(file, fileListArg);
            }
            return false;
          }}
          {...uploadProps}
        >
          <div
            className={clsx(
              `ant-input border border-gray-300 h-[111px] w-full 
            flex flex-col gap-1 justify-center items-center cursor-pointer rounded-lg transition-all transform-duration-300 bg-[url("/assets/file-upload-bg.png")] bg-cover bg-center`,
              internalList.length > 0 ? "mb-3" : "",
              isError
                ? "!border-danger hover:border-danger"
                : "border-gray-300 hover:border-primary"
            )}
          >
            <div className="rounded-full bg-white border border-gray-300 p-1">
              <PiUploadFill className="text-light-primary" size={24} />
            </div>
            <Paragraph className="mb-0 text-center">{placeholder}</Paragraph>
          </div>
        </Upload>
      )}

      {internalList.map((file) => (
        <div
          key={file.uid}
          className="h-[40px] relative group flex justify-between items-center border border-gray-300 rounded-lg bg-white"
        >
          <CustomBadge label={getFileName(file)} className={"ms-2"} />

          <div className="flex text-sm relative">
            {showView && (
              <CustomButton
                btnType="secondary"
                onClick={() => window.open(getFileUrl(file), "_blank")}
                className="!rounded-none !h-[39px]"
                text="View"
              />
            )}
            {showDownload && (
              <a
                href={getFileUrl(file)}
                download={getFileName(file)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CustomButton type="link" className="!rounded-l-none !h-[39px]" text="Download" />
              </a>
            )}

            {!computedDisabled && (
              <button
                onClick={() => {
                  const updated = internalList.filter((f) => f.uid !== file.uid);
                  setInternalList(updated);

                  const updatedValue = updated.map((f) => (f.isRemote ? f.url : f));
                  onChange?.(updatedValue);

                  if (form && fieldName) {
                    form.setFields([{ name: fieldName, errors: [] }]);
                  }
                }}
                className={`
                    absolute top-[-7px] right-[-7px] rounded-full bg-background transition
                    ${isMobile ? "flex" : "hidden group-hover:flex hover:cursor-pointer"}
                  `}
              >
                <LuPlus
                  size={16}
                  className="rotate-45 text-gray-700 hover:text-red-600 transition-all"
                />
              </button>
            )}
          </div>
        </div>
      ))}

      {!loading && !showUploadInput && internalList.length === 0 && (
        <div className="rounded-md">
          <Alert type="warning" showIcon message="Failed to load file(s)" />
        </div>
      )}
    </div>
  );
}
