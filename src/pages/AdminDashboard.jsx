import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin.js';

const GAME_IDS = ['chainword', 'word4', 'tiles', 'squares', 'shabdal', 'cryptic'];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function UsersPane({ users, usersError, updateUser }) {
  const [saving, setSaving] = useState({});

  async function handleToggle(uid, field, value) {
    const key = `${uid}_${field}`;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await updateUser(uid, { [field]: value });
    } catch (err) {
      console.error('updateUser error:', err);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  }

  if (usersError) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
          <p className="font-semibold mb-1">Permission denied reading users collection</p>
          <p className="text-xs opacity-80 mb-3">Error: {usersError}</p>
          <p className="text-xs font-medium mb-2">Add the following rules in the Firebase Console → Firestore → Rules:</p>
          <pre className="text-xs bg-red-100 dark:bg-red-900/40 rounded p-3 overflow-x-auto whitespace-pre">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true;
    }

    match /users/{uid} {
      allow read: if request.auth != null &&
        (request.auth.uid == uid || isAdmin());
      allow write: if request.auth != null &&
        (request.auth.uid == uid || isAdmin());
      match /{sub}/{id} {
        allow read, write: if request.auth != null &&
          (request.auth.uid == uid || isAdmin());
      }
    }

    match /admin/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}`}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-scroll">
      <table className="min-w-[580px] w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <th className="pb-3 pr-4">User</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4 text-center">Admin</th>
            <th className="pb-3 pr-4 text-center">Paid</th>
            <th className="pb-3 pr-4 text-center">Beta</th>
            <th className="pb-3 text-right">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-gray-500">
                No users found
              </td>
            </tr>
          )}
          {users.map(u => (
            <tr
              key={u.uid}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      className="w-7 h-7 rounded-full flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                    {u.displayName || '—'}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                {u.email}
              </td>
              <td className="py-3 pr-4 text-center">
                <Toggle
                  checked={!!u.admin}
                  onChange={v => handleToggle(u.uid, 'admin', v)}
                  disabled={saving[`${u.uid}_admin`]}
                />
              </td>
              <td className="py-3 pr-4 text-center">
                <Toggle
                  checked={!!u.paid}
                  onChange={v => handleToggle(u.uid, 'paid', v)}
                  disabled={saving[`${u.uid}_paid`]}
                />
              </td>
              <td className="py-3 pr-4 text-center">
                <Toggle
                  checked={!!u.beta}
                  onChange={v => handleToggle(u.uid, 'beta', v)}
                  disabled={saving[`${u.uid}_beta`]}
                />
              </td>
              <td className="py-3 text-right text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                {u.createdAt?.toDate
                  ? u.createdAt.toDate().toLocaleDateString()
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GamesPane({ gamesConfig, globalConfig, updateGame, updateGlobalConfig }) {
  // Local draft state for text fields (title/desc) per game
  const [drafts, setDrafts] = useState({});
  const [savingGame, setSavingGame] = useState({});
  const [savingGlobal, setSavingGlobal] = useState(false);

  function getDraft(gameId, field) {
    return drafts[`${gameId}_${field}`] ?? gamesConfig[gameId]?.[field] ?? '';
  }

  function setDraft(gameId, field, value) {
    setDrafts(d => ({ ...d, [`${gameId}_${field}`]: value }));
  }

  async function saveGameTextField(gameId, field) {
    const value = getDraft(gameId, field);
    const current = gamesConfig[gameId]?.[field];
    if (value === current) return; // no change
    const key = `${gameId}_${field}`;
    setSavingGame(s => ({ ...s, [key]: true }));
    try {
      await updateGame(gameId, { [field]: value });
    } catch (err) {
      console.error('updateGame error:', err);
    } finally {
      setSavingGame(s => ({ ...s, [key]: false }));
      setDrafts(d => { const next = { ...d }; delete next[key]; return next; });
    }
  }

  async function handleGameToggle(gameId, value) {
    setSavingGame(s => ({ ...s, [`${gameId}_paid`]: true }));
    try {
      await updateGame(gameId, { paid: value });
    } catch (err) {
      console.error('updateGame paid error:', err);
    } finally {
      setSavingGame(s => ({ ...s, [`${gameId}_paid`]: false }));
    }
  }

  async function handleGlobalToggle(field, value) {
    setSavingGlobal(true);
    try {
      await updateGlobalConfig({ [field]: value });
    } catch (err) {
      console.error('updateGlobalConfig error:', err);
    } finally {
      setSavingGlobal(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Global config */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Global Config
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Ads Enabled</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Show ads to non-paid users</p>
          </div>
          <Toggle
            checked={!!globalConfig.ads_enabled}
            onChange={v => handleGlobalToggle('ads_enabled', v)}
            disabled={savingGlobal}
          />
        </div>
      </div>

      {/* Per-game config */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Games
        </h3>
        <div className="space-y-4">
          {GAME_IDS.map(gameId => {
            const cfg = gamesConfig[gameId] || {};
            return (
              <div
                key={gameId}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {gameId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Paid</span>
                    <Toggle
                      checked={!!cfg.paid}
                      onChange={v => handleGameToggle(gameId, v)}
                      disabled={savingGame[`${gameId}_paid`]}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={getDraft(gameId, 'title')}
                      onChange={e => setDraft(gameId, 'title', e.target.value)}
                      onBlur={() => saveGameTextField(gameId, 'title')}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={getDraft(gameId, 'desc')}
                      onChange={e => setDraft(gameId, 'desc', e.target.value)}
                      onBlur={() => saveGameTextField(gameId, 'desc')}
                      onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user, userProfile, darkMode }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const { users, usersError, gamesConfig, globalConfig, updateUser, updateGame, updateGlobalConfig, loading } = useAdmin();

  // Redirect non-admin users
  useEffect(() => {
    if (userProfile !== null && !userProfile.admin) {
      navigate('/', { replace: true });
    }
  }, [userProfile, navigate]);

  // Still loading auth — show nothing to avoid flash
  if (userProfile === null) return null;
  if (!userProfile.admin) return null;

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Back to home"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4">
        <div className="max-w-4xl mx-auto flex gap-0">
          {['users', 'games'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            Loading…
          </div>
        ) : activeTab === 'users' ? (
          <UsersPane users={users} usersError={usersError} updateUser={updateUser} />
        ) : (
          <GamesPane
            gamesConfig={gamesConfig}
            globalConfig={globalConfig}
            updateGame={updateGame}
            updateGlobalConfig={updateGlobalConfig}
          />
        )}
      </div>
    </div>
  );
}
