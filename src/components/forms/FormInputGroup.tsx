import cx from "classnames";
import React, { CSSProperties } from "react";
import FormError from "./FormError";

// Input group types
type FormInputGroupProps = {
  label: string;
  name: string;
  required?: boolean;
  children: JSX.Element;
  hideError?: boolean;
  hideLabel?: boolean;
  success: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Input group that contains a label, input and error message
 * @param {string} label The label to be used for the input
 * @param {string} name The name of the input
 * @param {boolean} required Whether or not the input is a required field
 * @param {React.ReactNode} children Input component
 * @param {boolean} hideError Whether or not to hide the error text (Useful for if you want to display the error outside of the input group component)
 * @param {boolean} hideLabel Whether or not to hide the label text
 * @param {boolean} success Whether or not the form submission was successful (Used to determine whether to show a success response)
 * @param {boolean} isLoading Whether or not the component is currently in a loading state
 * @param {string} className Custom classes for the component
 * @param {object} style Custom styling for the component
 * @returns An input group that contains a label, input and error message
 */
const FormInputGroup = ({
  label,
  name,
  required,
  children,
  hideError,
  hideLabel,
  success,
  className,
  style,
}: FormInputGroupProps) => (
  <div className={cx(className, "form-control mt-8 w-full")} style={style}>
    {!hideLabel && (
      <div className="label pt-0">
        <span className="label-text font-bold">
          {label} {!required ? "(optional)" : ""}
        </span>
      </div>
    )}
    {
      // Clones the element to pass props down to it
      React.cloneElement(children, { label, name, required, success })
    }
    {
      // Show the error if hideError is not set
      !hideError && <FormError inputName={name} />
    }
  </div>
);

export default FormInputGroup;
