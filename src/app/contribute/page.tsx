'use client';

import { useEffect, useState, ChangeEvent } from 'react';

export default function ContributePage() {
  const [token, setToken] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [images, setImages] = useState<FileList | null>(null);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
    setToken(storedToken);
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImages(e.target.files);
  };

    const handleSubmit = async () => {
  if (!orgName || !images || images.length === 0) {
    alert('Please provide all required inputs.');
    return;
  }

  const token = localStorage.getItem('id_token');
  if (!token) {
    alert('You must be logged in.');
    return;
  }

  const formData = new FormData();
  Array.from(images).forEach((file) => formData.append('gameImages', file));
  formData.append('orgName', orgName);
  formData.append('suggestions', suggestions);

  try {
    const response = await fetch('https://sjmpwxhxms.us-east-1.awsapprunner.com/api/ThinkMoves/ContributeThings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      alert('Contribution submitted successfully!');
    } else {
      const err = await response.text();
      alert(`Error: ${err}`);
    }
  } catch (err) {
    alert('Failed to submit. Please try again.');
    console.error(err);
  }
};


  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contribute Page</h1>

      {token ? (
        <div className="space-y-6 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          {/* Upload Images */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-sm"
            />
          </div>

          {/* Organisation Name */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">Organisation Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organisation name"
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-1">Suggestions</label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Write any suggestions..."
            />
          </div>

          {/* Upcoming Features Section */}
<div className="mt-10 space-y-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
  <h2 className="text-2xl font-semibold text-gray-800 mb-2">🚀 Upcoming Things</h2>
  <ul className="list-disc list-inside text-gray-700 space-y-2 text-base">
    <li><strong>Auto-Suggestion for Invalid Moves:</strong> Get clickable AI suggestions to fix incorrect moves.</li>
    <li><strong>Revisit Saved Positions & Games:</strong> Analyze your saved games anytime.</li>
    <li><strong>Community Leaderboard:</strong> Track contributions and climb the ranks.</li>
    <li><strong>Share Games and Positions:</strong> Easily share your games with friends.</li>
    <li><strong>Multi-Language Support (Planned):</strong> Explore ThinkMoves in your regional language.</li>
    <li><strong>Profile Page Enhancements:</strong> View your activity, saved content, and preferences.</li>
    <li><strong>Add Friends Feature (Planned):</strong> Connect with other players on the platform.</li>
  </ul>
</div>


          {/* Submit Button (inactive) */}
          <div>
            <button
                    onClick={handleSubmit}
    className="bg-blue-600 text-white px-5 py-2 rounded-md text-base hover:bg-blue-700 transition"
  >
    Submit
  </button>
</div>
        </div>
      ) : (
        <p className="text-lg text-red-600">Please log in to contribute.</p>
      )}
    </div>

    
    
  );
}
