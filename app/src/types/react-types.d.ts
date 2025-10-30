// Type augmentations for React compatibility
/// <reference types="react" />

// Extend React namespace with missing types
declare module 'react' {
  // Add missing ElementType if not present
  type ElementType = any;
}
