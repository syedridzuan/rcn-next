## Recipe Image Handler Implementation

Create a comprehensive image handling system for a recipe application with the following requirements:

### Database Schema Integration
Use the following Prisma model for image handling:
```prisma
model RecipeImage {
  id           String   @id @default(cuid())
  originalUrl  String
  thumbnailUrl String
  mediumUrl    String
  largeUrl     String
  alt          String?
  recipeId     String
  recipe       Recipe   @relation(fields: [recipeId], references: [id])
  createdAt    DateTime @default(now())
  isHero       Boolean  @default(false)
}
```

### Core Requirements

1. Image Processing Service:
   - Create a service that handles image upload and processing
   - Generate multiple image sizes: original, large (1024px), medium (640px), thumbnail (320px)
   - Maintain aspect ratios during resizing
   - Implement JPEG optimization with varying quality levels
   - Handle error cases and cleanup

2. File Management:
   - Implement secure file upload handling
   - Create organized directory structure for images
   - Generate unique filenames using CUID
   - Clean up temporary files after processing
   - Handle file type validation
   - Implement size limits (5MB max)

3. API Integration:
   - Create RESTful endpoints for image operations
   - Implement image upload with recipe creation/editing
   - Handle multiple image uploads
   - Provide image deletion functionality
   - Implement error handling and validation

### Technical Specifications

1. File Structure:
```
/app
  /api
    /images
      /route.ts       # API endpoints
  /lib
    /images
      /process.ts    # Image processing logic
      /upload.ts     # Upload handling
      /validate.ts   # Validation functions
  /types
    /images.ts      # Type definitions
```

2. Required Dependencies:
```json
{
  "sharp": "^0.32.0",
  "cuid": "^3.0.0"
}
```

3. Environment Variables:
```
UPLOAD_DIR=public/uploads/recipes
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_TYPES=image/jpeg,image/png,image/webp
```

### Implementation Details

1. Image Processing Function:
```typescript
interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

async function processImage(
  input: Buffer,
  options: ImageProcessingOptions
): Promise<Buffer>;
```

2. Upload Handler:
```typescript
interface UploadResult {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

async function handleImageUpload(
  file: File,
  recipeId: string
): Promise<UploadResult>;
```

3. Validation Requirements:
- File size check (5MB limit)
- File type validation (JPEG, PNG, WebP)
- Image dimensions check
- File integrity verification

### API Endpoints

1. Image Upload:
```typescript
POST /api/images
Content-Type: multipart/form-data
Body: {
  image: File,
  recipeId: string,
  isHero?: boolean
}
```

2. Image Delete:
```typescript
DELETE /api/images/${imageId}
```

### Error Handling

Implement comprehensive error handling for:
- File size exceeded
- Invalid file type
- Processing failures
- Storage errors
- Database errors
- Missing files
- Corrupt images

### Security Considerations

1. File Validation:
- Implement strict file type checking
- Validate file contents beyond extension
- Sanitize filenames
- Implement rate limiting

2. Storage Security:
- Use secure file permissions
- Implement access control
- Prevent directory traversal
- Handle concurrent uploads safely

### Performance Optimization

1. Image Processing:
- Implement efficient resizing algorithms
- Use appropriate quality settings per size
- Enable progressive loading
- Implement caching strategies

2. Upload Handling:
- Handle chunked uploads
- Implement upload progress
- Use streams for large files
- Optimize concurrent uploads

### Testing Requirements

1. Unit Tests:
- Test image processing functions
- Validate file handling
- Test error cases
- Mock file system operations

2. Integration Tests:
- Test API endpoints
- Verify database operations
- Test concurrent uploads
- Validate cleanup processes

### Frontend Integration

Provide examples for:
1. Upload Component:
```typescript
interface ImageUploadProps {
  onUpload: (result: UploadResult) => void;
  onError: (error: Error) => void;
  maxSize?: number;
  allowedTypes?: string[];
}
```

2. Image Preview:
```typescript
interface ImagePreviewProps {
  urls: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  alt?: string;
}
```

### Documentation Requirements

Include documentation for:
1. Setup instructions
2. API endpoints
3. Configuration options
4. Error codes and handling
5. Security best practices
6. Performance optimization tips
7. Frontend integration guide

### Maintenance Considerations

1. Image Cleanup:
- Implement periodic cleanup of unused images
- Handle orphaned files
- Maintain storage quotas
- Log cleanup operations

2. Monitoring:
- Track upload success/failure rates
- Monitor storage usage
- Track processing times
- Alert on errors

This implementation should provide a robust, secure, and efficient system for handling recipe images while maintaining good performance and user experience.