import cx from "classnames";
import { CSSProperties } from "react";
import { useFormContext } from "react-hook-form";

// Form input props
type FormInputProps = {
  name?: string;
  label?: string;
  placeholder?: string;
  hidePlaceholder?: boolean;
  customValidation?: object;
  required?: boolean;
  success?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Wrapper component for a react hook form input
 * @returns A input that works with react form hook
 */
const FormInput = ({ name, label, placeholder, hidePlaceholder, customValidation, required, success, className, style }: FormInputProps) => {
  // Use form context
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Hooks inputs to using react form hook
  const hookInput = (inputName: string, inputLabel: string, options: object) =>
    register(inputName, {
      required: { value: required || true, message: `${inputLabel} is required` },
      maxLength: { value: 255, message: `${inputLabel} can only be 255 characters long` },
      ...options,
    });

  // Return early if name and label is not provided
  if (!name || !label) {
    return null;
  }

  return (
    <input
      type="text"
      className={cx(className, "input-group input input-bordered", {
        "input-error": errors[name],
        "input-success": success,
      })}
      style={style}
      placeholder={!hidePlaceholder ? "Enter " + (placeholder || label).toLowerCase() : ""}
      {...hookInput(name, label, customValidation ?? {})}
    />
  );
};

export default FormInput;
