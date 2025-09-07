'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

interface AutoErrorCorrectionProps {
  generatedCode: string;
  onCodeCorrected: (correctedCode: string) => void;
  onErrorsDetected: (errors: CodeError[]) => void;
}

interface CodeError {
  id: string;
  type: 'syntax' | 'import' | 'type' | 'dependency' | 'runtime';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  autoFixable: boolean;
}

const AutoErrorCorrection: React.FC<AutoErrorCorrectionProps> = ({
  generatedCode,
  onCodeCorrected,
  onErrorsDetected
}) => {
  const [errors, setErrors] = useState<CodeError[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedCode, setFixedCode] = useState<string>('');

  // Analyze code for common errors
  const analyzeCode = async (code: string): Promise<CodeError[]> => {
    const detectedErrors: CodeError[] = [];
    let errorId = 1;

    // Check for common TypeScript/React errors
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Missing imports
      if (line.includes('useState') && !code.includes('import { useState }')) {
        detectedErrors.push({
          id: `error-${errorId++}`,
          type: 'import',
          message: 'Missing React useState import',
          line: lineNumber,
          suggestion: "Add: import { useState } from 'react';",
          autoFixable: true
        });
      }
      
      if (line.includes('useEffect') && !code.includes('import { useEffect }')) {
        detectedErrors.push({
          id: `error-${errorId++}`,
          type: 'import',
          message: 'Missing React useEffect import',
          line: lineNumber,
          suggestion: "Add: import { useEffect } from 'react';",
          autoFixable: true
        });
      }

      // Lucide React icons usage
      const lucideIconMatch = line.match(/<([A-Z][a-zA-Z]*)\s/);
      if (lucideIconMatch && !code.includes(`import { ${lucideIconMatch[1]} }`)) {
        detectedErrors.push({
          id: `error-${errorId++}`,
          type: 'import',
          message: `Missing Lucide React icon import: ${lucideIconMatch[1]}`,
          line: lineNumber,
          suggestion: `Add: import { ${lucideIconMatch[1]} } from 'lucide-react';`,
          autoFixable: true
        });
      }

      // Tailwind CSS class issues
      if (line.includes('className=') && line.includes('bg-gradient-to-')) {
        if (!line.includes('from-') || !line.includes('to-')) {
          detectedErrors.push({
            id: `error-${errorId++}`,
            type: 'syntax',
            message: 'Incomplete Tailwind gradient classes',
            line: lineNumber,
            suggestion: 'Ensure gradient has both from- and to- classes',
            autoFixable: true
          });
        }
      }

      // TypeScript type issues
      if (line.includes('const ') && line.includes('=') && !line.includes(':')) {
        const varMatch = line.match(/const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (varMatch && line.includes('useState')) {
          detectedErrors.push({
            id: `error-${errorId++}`,
            type: 'type',
            message: `Missing type annotation for useState variable: ${varMatch[1]}`,
            line: lineNumber,
            suggestion: `Add type: const ${varMatch[1]}: [Type, React.Dispatch<React.SetStateAction<Type>>] = useState();`,
            autoFixable: true
          });
        }
      }
    });

    // Check for missing shadcn-ui components
    const shadcnComponents = ['Button', 'Card', 'Input', 'Label', 'Select', 'Textarea'];
    shadcnComponents.forEach(component => {
      if (code.includes(`<${component}`) && !code.includes(`import { ${component} }`)) {
        detectedErrors.push({
          id: `error-${errorId++}`,
          type: 'import',
          message: `Missing shadcn-ui component import: ${component}`,
          suggestion: `Add: import { ${component} } from '@/components/ui/${component.toLowerCase()}';`,
          autoFixable: true
        });
      }
    });

    return detectedErrors;
  };

  // Auto-fix detected errors
  const autoFixCode = async (code: string, errors: CodeError[]): Promise<string> => {
    let fixedCode = code;
    const imports = new Set<string>();
    const reactImports = new Set<string>();
    const lucideImports = new Set<string>();
    const shadcnImports = new Set<string>();

    errors.forEach(error => {
      if (!error.autoFixable) return;

      switch (error.type) {
        case 'import':
          if (error.message.includes('React useState')) {
            reactImports.add('useState');
          } else if (error.message.includes('React useEffect')) {
            reactImports.add('useEffect');
          } else if (error.message.includes('Lucide React icon')) {
            const iconMatch = error.suggestion?.match(/import { ([^}]+) }/);
            if (iconMatch) {
              lucideImports.add(iconMatch[1]);
            }
          } else if (error.message.includes('shadcn-ui component')) {
            const componentMatch = error.suggestion?.match(/import { ([^}]+) }/);
            if (componentMatch) {
              shadcnImports.add(componentMatch[1]);
            }
          }
          break;

        case 'syntax':
          if (error.message.includes('Tailwind gradient')) {
            // Fix incomplete gradients
            fixedCode = fixedCode.replace(
              /bg-gradient-to-[a-z]+(?!\s+from-)/g,
              'bg-gradient-to-r from-purple-600 to-blue-600'
            );
          }
          break;

        case 'type':
          if (error.message.includes('useState variable')) {
            // Add basic type annotations (simplified)
            fixedCode = fixedCode.replace(
              /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*useState\(/g,
              'const [$1, set$1] = useState('
            );
          }
          break;
      }
    });

    // Add imports at the top
    const lines = fixedCode.split('\n');
    const importIndex = lines.findIndex(line => line.includes("'use client';")) + 1;

    const newImports: string[] = [];
    
    if (reactImports.size > 0) {
      const existingReactImport = lines.find(line => line.includes("from 'react'"));
      if (existingReactImport) {
        // Update existing import
        const reactImportArray = Array.from(reactImports);
        const updatedImport = existingReactImport.replace(
          /import\s*{\s*([^}]*)\s*}\s*from\s*'react'/,
          (match, existing) => {
            const existingImports = existing.split(',').map((s: string) => s.trim()).filter(Boolean);
            const allImports = [...new Set([...existingImports, ...reactImportArray])];
            return `import { ${allImports.join(', ')} } from 'react'`;
          }
        );
        lines[lines.indexOf(existingReactImport)] = updatedImport;
      } else {
        newImports.push(`import { ${Array.from(reactImports).join(', ')} } from 'react';`);
      }
    }

    if (lucideImports.size > 0) {
      newImports.push(`import { ${Array.from(lucideImports).join(', ')} } from 'lucide-react';`);
    }

    shadcnImports.forEach(component => {
      newImports.push(`import { ${component} } from '@/components/ui/${component.toLowerCase()}';`);
    });

    // Insert new imports
    lines.splice(importIndex, 0, ...newImports);

    return lines.join('\n');
  };

  // Run analysis when code changes
  useEffect(() => {
    if (!generatedCode) return;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const detectedErrors = await analyzeCode(generatedCode);
        setErrors(detectedErrors);
        onErrorsDetected(detectedErrors);

        // Auto-fix if there are fixable errors
        if (detectedErrors.some(e => e.autoFixable)) {
          setIsFixing(true);
          const corrected = await autoFixCode(generatedCode, detectedErrors);
          setFixedCode(corrected);
          
          // Re-analyze fixed code to see if errors were resolved
          const remainingErrors = await analyzeCode(corrected);
          const fixedErrors = detectedErrors.filter(e => 
            !remainingErrors.some(re => re.message === e.message)
          );
          
          if (fixedErrors.length > 0) {
            onCodeCorrected(corrected);
          }
          setIsFixing(false);
        }
      } catch (error) {
        console.error('Error analyzing code:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce analysis
    const timeout = setTimeout(runAnalysis, 1000);
    return () => clearTimeout(timeout);
  }, [generatedCode, onCodeCorrected, onErrorsDetected]);

  if (!errors.length && !isAnalyzing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700">No errors detected - code looks good!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isAnalyzing && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700">Analyzing code for errors...</span>
        </div>
      )}

      {isFixing && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-700">Auto-fixing detected errors...</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              {errors.length} issue{errors.length > 1 ? 's' : ''} detected
            </span>
          </div>
          
          <div className="space-y-2">
            {errors.map((error) => (
              <div
                key={error.id}
                className={`p-3 rounded-lg border ${
                  error.autoFixable
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        error.type === 'import' ? 'bg-blue-100 text-blue-700' :
                        error.type === 'syntax' ? 'bg-orange-100 text-orange-700' :
                        error.type === 'type' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {error.type}
                      </span>
                      {error.line && (
                        <span className="text-xs text-gray-500">Line {error.line}</span>
                      )}
                      {error.autoFixable && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Auto-fixed
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 text-gray-700">{error.message}</p>
                    {error.suggestion && (
                      <p className="text-xs mt-1 text-gray-600 font-mono bg-gray-100 p-2 rounded">
                        {error.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoErrorCorrection;
