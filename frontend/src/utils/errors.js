/**
 * Parses axios error responses and returns a user-friendly error message.
 * Specifically handles FastAPI string details and Pydantic validation arrays (422 status).
 */
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    
    // Check for string detail
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    
    // Check for Pydantic validation error list
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((err) => {
          const field = err.loc[err.loc.length - 1];
          return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.msg}`;
        })
        .join(', ');
    }
    
    // Check for custom message field
    if (data.message) {
      return data.message;
    }
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};
