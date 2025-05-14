export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to JudgeAndSolve
        </h1>
        <p className="text-center text-lg mb-8">
          Solve coding problems, improve your skills, and compete with others
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Problems */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Featured Problems</h2>
            <p className="text-gray-600">
              Start solving our carefully curated collection of coding problems
            </p>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
              Browse Problems
            </button>
          </div>

          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
            <p className="text-gray-600">
              See how you rank against other developers
            </p>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
              View Leaderboard
            </button>
          </div>

          {/* Profile */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
            <p className="text-gray-600">
              Track your solving progress and improve your skills
            </p>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 