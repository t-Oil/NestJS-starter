export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  requireFilesInEachField?: boolean;
  store?: string;
}
