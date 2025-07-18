export interface AppError {
  message: string;
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  originalError?: unknown;
  context?: string;
}

export class ErrorHandler {
  static handle(error: unknown, context: string = 'Unknown'): AppError {
    // Handle Axios/API errors
    if (this.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || 'Network error occurred',
        type: this.getErrorType(error.response?.status),
        originalError: error,
        context,
      };
    }

    // Handle generic errors
    if (error instanceof Error) {
      return {
        message: error.message,
        type: 'unknown',
        originalError: error,
        context,
      };
    }

    // Handle unknown errors
    return {
      message: 'An unexpected error occurred',
      type: 'unknown',
      originalError: error,
      context,
    };
  }

  private static isAxiosError(error: unknown): error is {
    response?: { status: number; data?: { message: string } };
    message: string;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      'message' in error
    );
  }

  private static getErrorType(status?: number): AppError['type'] {
    if (!status) return 'network';
    
    if (status >= 400 && status < 500) {
      return status === 401 || status === 403 ? 'auth' : 'validation';
    }
    
    if (status >= 500) return 'server';
    
    return 'network';
  }

  static getDisplayMessage(error: AppError): string {
    switch (error.type) {
      case 'auth':
        return 'Please log in to continue';
      case 'network':
        return 'Connection error. Please check your internet connection';
      case 'server':
        return 'Server error. Please try again later';
      case 'validation':
        return error.message;
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
}
