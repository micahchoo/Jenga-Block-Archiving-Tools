// App.jsx
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ImageViewer } from './components/ImageViewer';
import '@annotorious/react/annotorious-react.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-900">
        <header className="shrink-0 bg-gray-800 text-white px-4 py-2 border-b border-gray-700">
          <h1 className="text-xl font-semibold">Immich Editor Test</h1>
        </header>
        <main className="flex flex-1 relative overflow-hidden">
          <ImageViewer />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;