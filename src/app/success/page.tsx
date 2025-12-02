export default function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Registration Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for registering. You'll receive a confirmation email shortly.
        </p>
        
        <a href="/"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}