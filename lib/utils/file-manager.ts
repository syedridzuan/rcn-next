import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { config } from '../config';

export interface FileMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
}

export class FileManager {
  private readonly baseDir: string;
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;
  private readonly mimeTypeToExt: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  };

  constructor(
    baseDir: string = config.upload.directory,
    maxFileSize: number = config.upload.maxFileSize,
    allowedMimeTypes: string[] = config.upload.allowedTypes
  ) {
    this.baseDir = path.join(process.cwd(), baseDir);
    this.maxFileSize = maxFileSize;
    this.allowedMimeTypes = allowedMimeTypes;
  }

  /**
   * Gets the absolute path from a URL path
   */
  getAbsolutePathFromUrl(urlPath: string): string {
    // Remove leading slash and split path
    const cleanPath = urlPath.replace(/^\//, '');
    // Get the part after 'public/'
    const relativePath = cleanPath.split('public/').pop() || cleanPath;
    return path.join(process.cwd(), 'public', relativePath);
  }

  /**
   * Validates file metadata before saving
   */
  validateFile(metadata: FileMetadata): void {
    if (metadata.size > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
    }

    if (!this.allowedMimeTypes.includes(metadata.mimeType)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    const ext = path.extname(metadata.originalName).toLowerCase();
    const validExtensions = this.mimeTypeToExt[metadata.mimeType] || [];
    if (!validExtensions.includes(ext)) {
      throw new Error(`Invalid file extension for ${metadata.mimeType}. Allowed extensions: ${validExtensions.join(', ')}`);
    }
  }

  /**
   * Gets file extension from mime type
   */
  getPreferredExtension(mimeType: string): string {
    return this.mimeTypeToExt[mimeType]?.[0] || '.jpg';
  }

  /**
   * Ensures the upload directory exists
   */
  async ensureDirectory(subDir?: string): Promise<string> {
    const targetDir = subDir ? path.join(this.baseDir, subDir) : this.baseDir;
    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  }

  /**
   * Generates a unique filename
   */
  generateUniqueFilename(originalName: string, prefix?: string): string {
    const mimeType = this.getMimeTypeFromFilename(originalName);
    const ext = this.getPreferredExtension(mimeType);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix ? prefix + '-' : ''}${timestamp}-${random}${ext}`;
  }

  /**
   * Gets MIME type from filename
   */
  private getMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    for (const [mimeType, extensions] of Object.entries(this.mimeTypeToExt)) {
      if (extensions.includes(ext)) {
        return mimeType;
      }
    }
    return 'image/jpeg'; // default
  }

  /**
   * Saves a file to the filesystem
   */
  async saveFile(
    buffer: Buffer,
    filename: string,
    subDir?: string
  ): Promise<string> {
    const targetDir = await this.ensureDirectory(subDir);
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Checks if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file from the filesystem
   */
  async deleteFile(urlPath: string): Promise<void> {
    const filePath = this.getAbsolutePathFromUrl(urlPath);
    
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) {
        console.warn(`File not found: ${filePath}`);
        return;
      }

      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 