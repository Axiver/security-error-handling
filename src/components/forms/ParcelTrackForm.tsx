import { FormInputGroup, FormTextInput } from "@/components/forms";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { parcels } from "../parcelTracker/ParcelTracker";

// Form data type
type FormData = {
  trackingId: string;
};

type FormProps = {
  onValidTrackingId: Function;
  className?: string;
};

// Parcel tracking id form
const ParcelTrackForm = ({ onValidTrackingId, className }: FormProps) => {
  // States
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialise react hook forms
  const formHook = useForm<FormData>();

  // Deconstruct the individual hooks from the object
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = formHook;

  // Form submit handler
  const onSubmit = async (data: FormData) => {
    // Deconstruct values from data
    const { trackingId } = data;

    // Check if a valid tracking id was provided
    if (!Object.keys(parcels).includes(trackingId)) {
      // Invalid tracking id provided, set the error state
      setError("trackingId", { message: "Invalid tracking id provided" });
      return;
    }

    // Success, reset the default value of the inputs and show success message
    reset(data, { keepValues: true });
    setSubmitSuccess(true);

    // Invoke callback
    onValidTrackingId(trackingId);
  };

  // Clear success state of the form as soon as a input value changes
  useEffect(() => {
    // Checks that the form submission state is currently successful, and that there is at least 1 dirty input
    if (submitSuccess && isDirty) {
      // There is at least 1 dirty input, clear the success status of the form
      setSubmitSuccess(false);
    }
  }, [isDirty]);

  return (
    <FormProvider {...formHook}>
      <form className={className} onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold">Track parcel</h2>
        <p className="mt-4">Key in individual package number to track</p>
        <FormInputGroup label="Tracking ID" name="trackingId" success={submitSuccess} required>
          <FormTextInput hidePlaceholder />
        </FormInputGroup>
        <button
          type="submit"
          className="btn btn-primary text-base-100 w-full mt-2 font-bold normal-case text-base rounded-md"
        >
          Track
        </button>
      </form>
    </FormProvider>
  );
};

export default ParcelTrackForm;
