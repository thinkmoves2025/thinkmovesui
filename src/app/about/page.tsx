'use client';

import { useState } from 'react';

export default function AboutPage() {
  const [orgName, setOrgName] = useState('');
  const [suggestions, setSuggestions] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [token, setToken] = useState(true); // simulate logged-in user

  const handleImageChange = () => {};
  const handleSubmit = () => alert('Submitted');

  return (
    <main className="px-6 py-12 max-w-5xl mx-auto font-sans">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">About ThinkMoves</h1>

      {token ? (
        <section className="space-y-12">

          {/* Contribution Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">📢 How You Can Contribute</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>Use <strong>Organisation Name: Feedback</strong> to submit ideas.</li>
              <li>Upload <strong>Chess Score Sheet Images</strong> (front & back).</li>
              <li>Group uploads by <strong>organization name</strong> (e.g. USCF, FIDE).</li>
              <li>Your data improves accuracy and helps grow the platform.</li>
            </ul>
          </div>

          {/* Upload & Contribute Form */}
          <div className="bg-white border border-gray-200 rounded-xl shadow p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">📤 Upload & Contribute</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. USCF, FIDE, Feedback"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Chess Score Sheet Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">You can upload multiple images grouped by organization.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions / Feedback</label>
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  rows={4}
                  placeholder="Write your suggestions or feedback here..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 transition"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Download Examples */}
          <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">📥 Download Examples</h2>
            <p className="text-sm text-gray-700">
              Download sample games or blank ChessGrow scoresheets to use in your tournaments and upload later.
            </p>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>📄 <a href="/downloads/game1.zip" download className="text-blue-600 underline">Download Game 1 (ZIP)</a></li>
              <li>📄 <a href="/downloads/game2.zip" download className="text-blue-600 underline">Download Game 2 (ZIP)</a></li>
              <li>
  📄 <a href="/downloads/ChessGrowEmpty.zip" download className="text-blue-600 underline">
    Download Blank ChessGrow Scoresheet (ZIP)
  </a>
</li>

            </ul>
          </div>

          {/* Upcoming Features */}
          <div className="bg-white border border-gray-200 rounded-xl shadow p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">🚀 Upcoming Features</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li><strong>AI Suggestions:</strong> Fix invalid moves automatically.</li>
              <li><strong>Saved Game History:</strong> Revisit and review games.</li>
              <li><strong>Leaderboard:</strong> Track top contributors.</li>
              <li><strong>Game Sharing:</strong> Share PGNs and positions easily.</li>
              <li><strong>Multi-Language Support:</strong> Localize for regions.</li>
              <li><strong>Profile Enhancements:</strong> Track your growth.</li>
              <li><strong>Friends Feature:</strong> Connect with other players.</li>
            </ul>
          </div>

        </section>
      ) : (
        <p className="text-lg text-red-600 text-center mt-10">Please log in to contribute.</p>
      )}
    </main>
  );
}
