import { useState } from "react";

const EditableField = ({ initialValue, onSave, type = "number" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValue);
    }
  };

  const handleSave = () => {
    if (type === "number") {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onSave(numValue);
        setIsEditing(false);
      }
    } else {
      if (value.trim()) {
        onSave(value.trim());
        setIsEditing(false);
      }
    }
  };

  if (isEditing) {
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`rounded border border-gray-300 px-1 text-black focus:outline-none focus:ring focus:ring-blue-300 ${
          type === "number" ? "w-8 text-center" : "w-full"
        } [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer rounded px-0.5 hover:bg-blue-100"
    >
      {value}
    </span>
  );
};

export default EditableField;
