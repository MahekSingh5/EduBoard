import React from 'react';
import Loader from '../common/Loader';

export default function ClassroomLayout({
  header,
  sidebar,
  activeTab,
  children,
  isLoading = false,
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      {header}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && React.cloneElement(sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) })}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div className="h-full">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
