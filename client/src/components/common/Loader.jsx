export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
        {/* Inner pulsing ring */}
        <div className="relative w-16 h-16 rounded-full border-4 border-blue-200 animate-pulse"></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-semibold animate-pulse">{text}</p>
      )}
    </div>
  );
}
