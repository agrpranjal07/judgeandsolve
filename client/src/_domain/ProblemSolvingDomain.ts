import { TestResult } from '../_services/problem.service';

export class ProblemSolvingDomain {
  static validateCode(code: string, language: string): { isValid: boolean; message?: string } {
    if (!code.trim()) {
      return { isValid: false, message: 'Code cannot be empty' };
    }

    if (code.length > 50000) {
      return { isValid: false, message: 'Code is too long (max 50,000 characters)' };
    }

    // Language-specific validations
    switch (language) {
      case 'python':
        if (!code.includes('def ') && !code.includes('class ')) {
          return { isValid: false, message: 'Python code should contain at least one function or class definition' };
        }
        break;
      case 'javascript':
        if (!code.includes('function') && !code.includes('=>') && !code.includes('const ') && !code.includes('let ')) {
          return { isValid: false, message: 'JavaScript code should contain function definitions or variable declarations' };
        }
        break;
      case 'cpp':
        if (!code.includes('#include') || !code.includes('int main')) {
          return { isValid: false, message: 'C++ code should include headers and main function' };
        }
        break;
    }

    return { isValid: true };
  }

  static calculateScore(results: TestResult[]): number {
    if (results.length === 0) return 0;
    
    const passedCount = results.filter(r => r.passed).length;
    return Math.round((passedCount / results.length) * 100);
  }

  static getDefaultCode(language: string): string {
    const templates = {
      python: `def solve():
    # Write your solution here
    pass

# Test your solution
result = solve()
print(result)`,
      javascript: `function solve() {
    // Write your solution here
    return null;
}

// Test your solution
const result = solve();
console.log(result);`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`
    };

    return templates[language as keyof typeof templates] || templates.python;
  }

  static formatRuntime(runtime: number): string {
    if (runtime < 1000) {
      return `${runtime}ms`;
    }
    return `${(runtime / 1000).toFixed(2)}s`;
  }

  static formatMemory(memory: number): string {
    if (memory < 1024) {
      return `${memory}KB`;
    }
    return `${(memory / 1024).toFixed(2)}MB`;
  }

  static getVerdictColor(verdict: string): string {
    const colors = {
      'ACCEPTED': 'bg-green-100 text-green-800 border-green-200',
      'WRONG_ANSWER': 'bg-red-100 text-red-800 border-red-200',
      'TIME_LIMIT_EXCEEDED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'MEMORY_LIMIT_EXCEEDED': 'bg-orange-100 text-orange-800 border-orange-200',
      'RUNTIME_ERROR': 'bg-purple-100 text-purple-800 border-purple-200',
      'COMPILATION_ERROR': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return colors[verdict as keyof typeof colors] || colors['COMPILATION_ERROR'];
  }
}
