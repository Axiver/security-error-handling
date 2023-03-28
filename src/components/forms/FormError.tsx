import cx from "classnames";
import { useFormContext } from "react-hook-form";
import { CSSProperties } from "react";
import { ExclamationCircle } from "react-bootstrap-icons";

// Form error props
type FormErrorProps = {
  inputName: string;
  error?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Displays an error message
 * @returns Displays an error message (if any)
 */
const FormError = ({ inputName, error, className, style }: FormErrorProps) => {
  // -- Obtain the error message to be displayed -- //
  // Initialise the error message
  let errorMessage: string | undefined;

  // Retrieve form context if the component is not in a loading state
  const {
    formState: { errors },
  } = useFormContext();

  // Check if a name of a input was provided and the input is errored
  if (inputName && errors[inputName] !== undefined) {
    // Input name provided, retrieve the error message from the input
    errorMessage = errors[inputName]?.message?.toString();
  }

  // Check if an error message was explicitly provided
  if (error) {
    // A custom error message was provided
    errorMessage = error;
  }

  return (
    <div className={cx(className, "w-full text-left h-5 mt-2 mb-1 flex items-center")} style={style}>
      {errorMessage && <ExclamationCircle className="text-error" size={14} />}
      <p className="text-error text-sm ml-2">{errorMessage}</p>
    </div>
  );
};

export default FormError;
