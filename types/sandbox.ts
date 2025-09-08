// Global types for sandbox file management

import { FileManifest } from './file-manifest';

export interface SandboxFile {
  content: string;
  lastModified: number;
}

export interface SandboxFileCache {
  files: Record<string, SandboxFile>;
  lastSync: number;
  sandboxId: string;
  manifest?: FileManifest;
}

// E2B Sandbox instance type (simplified interface)
export interface E2BSandbox {
  id: string;
  url?: string;
  files?: Record<string, SandboxFile>;
  close(): Promise<void>;
  [key: string]: any; // Allow additional E2B-specific methods
}

export interface SandboxState {
  fileCache: SandboxFileCache | null;
  sandbox: E2BSandbox | null;
  sandboxData: {
    sandboxId: string;
    url: string;
  } | null;
}

// Declare global types
declare global {
  var activeSandbox: E2BSandbox | undefined;
  var sandboxState: SandboxState | undefined;
  var existingFiles: Set<string> | undefined;
}

export {};