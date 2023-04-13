import { FormInputGroup, FormTextInput } from "@/components/forms";
import MainLayout from "@/components/MainLayout";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

// Form data type
type FormData = {
  email: string;
  password: string;
};

// Login page
const Login = () => {
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
    const { email, password } = data;

    // Attempt to log the user in
    const authResult = await signIn("credentials", { email, password, redirect: false });

    // Check if it was successful
    if (!authResult?.ok) {
      // Sign in failed, set the error state
      // setError("email", { message: "Invalid email provided" });
      return;
    }

    // Success, reset the default value of the inputs and show success message
    reset(data, { keepValues: true });
    setSubmitSuccess(true);
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
      <div className="w-full px-4 lg:w-1/5 lg:px-0 lg:mx-auto">
        <form className="bg-base-100 text-center py-8 px-6 flex flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-2xl font-bold">Login</h2>
          <FormInputGroup label="Email" name="email" success={submitSuccess} required>
            <FormTextInput />
          </FormInputGroup>
          <FormInputGroup label="Password" name="password" success={submitSuccess} required>
            <FormTextInput />
          </FormInputGroup>
          <button type="submit" className="btn btn-primary text-base-100 w-full mt-2 font-bold normal-case text-base rounded-md">
            Login
          </button>
        </form>
      </div>
    </FormProvider>
  );
};

// -- Configure AuthGuard -- //
Login.allowNonAuthenticated = true;

// Page layout
Login.getLayout = (page: JSX.Element) => <MainLayout>{page}</MainLayout>;

export default Login;
