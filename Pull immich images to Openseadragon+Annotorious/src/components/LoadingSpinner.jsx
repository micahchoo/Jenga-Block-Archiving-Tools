// components/LoadingSpinner.jsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

// components/ErrorMessage.jsx
export const ErrorMessage = ({ message }) => (
  <div className="flex items-center justify-center h-full w-full text-red-500">
    <div className="bg-red-100 border border-red-400 px-4 py-3 rounded">
      {message}
    </div>
  </div>
);