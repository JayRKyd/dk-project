# Verification Details Page Issues & Questions

## Current Issues

1. **Database Query Error**
   - Error: `column "role" does not exist`
   - Occurs when trying to fetch verification documents
   - Seems to be a mismatch between table structure and query

2. **Image Loading Issues**
   - Images not displaying in the verification details page
   - URLs are being stored but not properly accessed
   - Need to verify if this is a storage bucket permission issue or URL processing issue

3. **Component Loading Issues**
   - Getting `does not provide an export named 'default'` error
   - Even after fixing export type, page still not loading properly
   - Need to verify if all dependencies are properly imported

## Questions to Investigate

1. **Database Structure**
   - What is the exact structure of our verification document tables?
   - How are role-specific document tables related to the users table?
   - Should we be using a view to combine all document types?

2. **Image Storage & Access**
   - How are document URLs currently stored in the database?
   - Are we using signed URLs or public URLs?
   - What are the storage bucket permissions?
   - Should we be using presigned URLs with short expiry for security?

3. **Component Architecture**
   - Is our current separation of concerns (user service, document service) the right approach?
   - Should we combine these services for better data consistency?
   - Are we handling role-specific document types efficiently?

4. **Data Flow**
   - How should we handle the relationship between user data and their documents?
   - Should we fetch everything in one query or keep it separate?
   - How can we optimize the number of database calls?

5. **Error Handling**
   - What's the best way to handle role-specific errors?
   - How should we handle missing or invalid documents?
   - What user feedback should we provide for different error cases?

## Potential Solutions to Explore

1. **Database Approach**
   - Create a unified view for all verification documents
   - Add proper role column to document tables
   - Use better table relationships

2. **Image Handling**
   - Implement proper URL signing service
   - Cache signed URLs
   - Add image loading states and error fallbacks

3. **Component Structure**
   - Combine services into a single verification service
   - Create role-specific document handlers
   - Implement better state management

## Next Steps

1. Need to verify current database schema
2. Test document URL generation and access
3. Review component lifecycle and data flow
4. Consider implementing a new database structure
5. Improve error handling and user feedback

## Questions for Claude

1. What's the best approach to handle role-specific document tables while maintaining type safety and avoiding the "role does not exist" error?

2. How should we structure the image URL handling to ensure secure but reliable access to verification documents?

3. What's the most efficient way to fetch and display verification documents while maintaining good separation of concerns?

4. Should we consider a different database structure to simplify our queries and improve performance?

5. What's the best practice for handling role-specific document types in TypeScript while keeping the code DRY? 