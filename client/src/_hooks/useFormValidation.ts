import { useState } from 'react';
import { z } from 'zod';
import { toast } from './use-toast';

type UseFormValidation<T> = {
  formData: T;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (
    submitCallback: (data: T) => Promise<void>
  ) => (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  validationErrors: z.ZodIssue[] | null;
  resetForm: () => void;
};

const useFormValidation = <T>(
  initialFormData: T,
  validationSchema: z.ZodSchema<T>
): UseFormValidation<T> => {
  const [formData, setFormData] = useState<T>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation errors for the changed field
    if (validationErrors) {
      setValidationErrors(
        validationErrors.filter((error) => error.path[0] !== name)
      );
    }
  };

  const handleSubmit = (submitCallback: (data: T) => Promise<void>) => async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors(null); // Clear previous validation errors

    try {
      // Client-side validation
      validationSchema.parse(formData);

      // If validation succeeds, call the provided submit callback
      await submitCallback(formData);

    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors(error.errors);
        // You might also want to display a toast here for validation errors
        // using the useToast hook in the component that uses this hook.
        toast({
          title: 'Validation Error',
          description: error.errors.map((error) => error.message).join(', '),
        });
      } else {
        // Handle other potential errors from the submitCallback
        console.error("Submission error:", error);
        // Display a generic error toast here or let the component handle it.
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors(null);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    validationErrors,
    resetForm,
  };
};

export default useFormValidation;
