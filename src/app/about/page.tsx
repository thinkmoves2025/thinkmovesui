'use client';

import { useEffect, useState, ChangeEvent } from 'react';

export default function AboutPage() {
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">About Page</h1>
      

      {token ? (
        
        <div className="space-y-6 bg-white shadow-md rounded-lg p-6 border border-gray-200">

          <h2 className="text-3xl font-bold mb-6 text-gray-800">Contribute Section</h2>

          {/* Instructions */}
<div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
  <p className="text-gray-800 mb-2">
    📢 <strong>How you can contribute:</strong>
  </p>
  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
    <li>
      To give feedback or suggestions, enter <strong>Organisation Name: Feedback</strong> and write your message below.
    </li>
    <li>
      You can also <strong>upload Chess Score Sheet Images</strong> — as many as you like!
    </li>
    <li>
      Please upload sheets grouped by <strong>chess organization name</strong> to help train the AI better.
    </li>
    <li>
      All contributions will help improve accuracy, features, and overall AI performance.
    </li>
  </ul>
</div>

<div className="max-w-2xl mx-auto px-4 py-10 font-sans">

  {/* Header */}
  <h1 className="text-3xl font-bold text-gray-800 mb-6">Contribute to ThinkMoves</h1>

  {/* Contribution Instructions */}
  <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-2">💡 How You Can Help</h2>
    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
      <li>
        To give suggestions, enter <strong>Organisation Name: Feedback</strong> and describe your thoughts.
      </li>
      <li>
        You can upload <strong>Chess Score Sheet Images</strong> — as many as you want.
      </li>
      <li>
        Try to upload grouped by <strong>organization name</strong> (e.g., USCF, FIDE, School Name, etc.) for better AI training.
      </li>
      <li>
        Your contributions help us improve accuracy and add more features.
      </li>
    </ul>
  </div>

  {/* Form Section */}
  <div className="space-y-6 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800">📤 Upload & Contribute</h2>

    {/* Organisation Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g. US Chess Federation or Feedback"
      />
    </div>

    {/* Upload Images */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Chess Score Sheet Images</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="w-full text-sm text-gray-600"
      />
      <p className="text-xs text-gray-500 mt-1">Upload multiple images grouped by organization for best results.</p>
    </div>

    {/* Suggestions */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Suggestions / Feedback</label>
      <textarea
        value={suggestions}
        onChange={(e) => setSuggestions(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="Write your suggestions or feedback here..."
      />
    </div>

    {/* Submit Button */}
    <div className="text-right">
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </div>
  </div>

  {/* Upcoming Features Section */}
  <div className="mt-10 space-y-4 bg-white shadow-md rounded-lg p-6 border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800">🚀 Upcoming Things</h2>
    <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
      <li><strong>Auto-Suggestion for Invalid Moves:</strong> Get clickable AI suggestions to fix incorrect moves.</li>
      <li><strong>Revisit Saved Positions & Games:</strong> Analyze your saved games anytime.</li>
      <li><strong>Community Leaderboard:</strong> Track contributions and climb the ranks.</li>
      <li><strong>Share Games and Positions:</strong> Easily share your games with friends.</li>
      <li><strong>Multi-Language Support (Planned):</strong> Explore ThinkMoves in your regional language.</li>
      <li><strong>Profile Page Enhancements:</strong> View your activity, saved content, and preferences.</li>
      <li><strong>Add Friends Feature (Planned):</strong> Connect with other players on the platform.</li>
    </ul>
  </div>
</div>

        </div>
      ) : (
        <p className="text-lg text-red-600">Please log in to contribute.</p>
      )}
    </div>

    //Write More details about contribute saction
    //Option to download images of ChessGrow
    //Example Chess Score Sheets download



    
    
  );
}
