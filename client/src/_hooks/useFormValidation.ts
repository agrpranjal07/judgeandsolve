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
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    // Validate the single field on change
    try {
      if (validationSchema instanceof z.ZodObject) {
        validationSchema.pick({ [name]: true }).parse({ [name]: value });
      }
      // Remove error for this field if valid
      setValidationErrors((prev) =>
        prev ? prev.filter((err) => err.path[0] !== name) : null
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Remove old error for this field and add new one
        setValidationErrors((prev) => [
          ...(prev ? prev.filter((err) => err.path[0] !== name) : []),
          ...error.errors,
        ]);
      }
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
        toast({
          title: 'Validation Error',
          description: error.errors.map((error) => error.message).join(', '),
        });
      } else {
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
