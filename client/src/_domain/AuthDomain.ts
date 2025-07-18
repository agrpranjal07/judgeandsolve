export class AuthDomain {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true };
  }

  static isValidUsername(username: string): { isValid: boolean; message?: string } {
    if (username.length < 3) {
      return { isValid: false, message: 'Username must be at least 3 characters long' };
    }

    if (username.length > 20) {
      return { isValid: false, message: 'Username must be no more than 20 characters long' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }

    return { isValid: true };
  }

  static shouldRedirectAfterLogin(pathname: string): boolean {
    const publicRoutes = ['/auth/login', '/auth/signup', '/'];
    return !publicRoutes.includes(pathname);
  }

  static getRedirectPath(): string {
    if (typeof window === 'undefined') return '/';
    
    const stored = sessionStorage.getItem('redirectAfterLogin');
    return stored || '/';
  }

  static setRedirectPath(path: string): void {
    if (typeof window === 'undefined') return;
    
    if (this.shouldRedirectAfterLogin(path)) {
      sessionStorage.setItem('redirectAfterLogin', path);
    }
  }

  static clearRedirectPath(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('redirectAfterLogin');
  }
}
