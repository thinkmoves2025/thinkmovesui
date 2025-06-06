'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
  const router = useRouter();
  const [gameCount, setGameCount] = useState<number>(0);
  const [positionCount, setPositionCount] = useState<number>(0);
  const [contributionCount, setContributionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');

    if (!idToken || !accessToken) {
      router.push('/login');
      return;
    }

    const fetchCounts = async () => {
      try {
        const res = await axios.get(
          'https://sjmpwxhxms.us-east-1.awsapprunner.com/api/Profile/PlayerSavedItemsCount',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Profile data:", res.data);

        setGameCount(res.data.savedGameCount || 0);
        setPositionCount(res.data.savedPositionCount || 0);
        setContributionCount(res.data.contributions || 0);
      } catch (err) {
        console.error('❌ Error fetching counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');

    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const region = process.env.NEXT_PUBLIC_COGNITO_REGION;

    if (!domain || !clientId || !region) {
      console.error('❌ Missing Cognito ENV variables');
      return router.push('/login');
    }

    const logoutUrl = `https://${domain}.auth.${region}.amazoncognito.com/logout?client_id=${clientId}&logout_uri=http://localhost:3000`;
    window.location.href = logoutUrl;
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600 text-lg">Loading profile data...</div>;
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Page</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-50 p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 text-sm mb-1">Games Saved</p>
          <p className="text-2xl font-semibold text-blue-700">{gameCount}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 text-sm mb-1">Positions Saved</p>
          <p className="text-2xl font-semibold text-orange-600">{positionCount}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 text-sm mb-1">Contributions</p>
          <p className="text-2xl font-semibold text-gray-700">{contributionCount}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
      >
        Logout
      </button>
    </div>
  );
}
