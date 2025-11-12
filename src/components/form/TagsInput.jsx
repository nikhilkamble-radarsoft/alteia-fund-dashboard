import { Flex, Input, Tag, theme, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { TiPlusOutline } from "react-icons/ti";

export default function TagsInput({ value = [], onChange }) {
  const { token } = theme.useToken();
  const [tags, setTags] = useState(value || []);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Auto focus handlers
  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    if (editInputIndex !== -1) editInputRef.current?.focus();
  }, [editInputIndex]);

  // Sync with parent form
  useEffect(() => {
    onChange?.(tags);
  }, [tags]);

  const handleClose = (removedTag) => {
    setTags((prev) => prev.filter((tag) => tag !== removedTag));
  };

  const handleInputConfirm = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const handleEditInputConfirm = () => {
    const trimmed = editInputValue.trim();
    const newTags = [...tags];

    if (!trimmed) {
      // remove tag if cleared
      newTags.splice(editInputIndex, 1);
    } else {
      newTags[editInputIndex] = trimmed;
    }

    setTags(newTags);
    setEditInputIndex(-1);
    setEditInputValue("");
  };

  const tagStyle = {
    height: 40, // matches Input large height
    lineHeight: "38px",
    display: "flex",
    alignItems: "center",
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    paddingInline: 10,
    fontSize: 14,
  };

  const inputStyle = {
    height: 40,
    borderRadius: token.borderRadiusLG,
    marginInlineEnd: 8,
    width: "auto",
    minWidth: 100,
  };

  const tagPlusStyle = {
    ...tagStyle,
    borderStyle: "dashed",
    color: token.colorTextSecondary,
    cursor: "pointer",
  };

  return (
    <Flex gap="8px" wrap>
      {tags.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={`edit-${tag}-${index}`}
              size="large"
              style={inputStyle}
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        const isLongTag = tag.length > 20;
        const tagElem = (
          <Tag
            key={`tag-${tag}-${index}`}
            closable
            style={tagStyle}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={(e) => {
                e.preventDefault();
                setEditInputIndex(index);
                setEditInputValue(tag);
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );

        return isLongTag ? (
          <Tooltip title={tag} key={`tooltip-${tag}-${index}`}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}

      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="large"
          style={inputStyle}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag
          style={tagPlusStyle}
          icon={<TiPlusOutline />}
          onClick={() => setInputVisible(true)}
          className="flex items-center gap-1"
        >
          Add Tag
        </Tag>
      )}
    </Flex>
  );
}
