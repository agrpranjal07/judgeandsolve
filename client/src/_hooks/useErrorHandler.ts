import { useToast } from "./use-toast";
import { ErrorHandler, AppError } from "@/_utils/errorHandler";

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: unknown, context: string = 'Operation') => {
    const appError = ErrorHandler.handle(error, context);
    const displayMessage = ErrorHandler.getDisplayMessage(appError);

    // Only show auth errors if they're not 401 (handled by interceptors)
    if (appError.type === 'auth' && context !== 'Token Refresh') {
      return appError;
    }

    toast({
      title: 'Error',
      description: displayMessage,
      variant: 'destructive',
    });

    return appError;
  };

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    context: string,
    onError?: (error: AppError) => void
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      const appError = handleError(error, context);
      onError?.(appError);
      return null;
    }
  };

  return {
    handleError,
    handleAsyncOperation,
  };
};
