import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { firebaseConfigured } from '../firebase.js';
import { db } from '../firebase.js';
import {
  collection, doc, getDoc, getDocs, query, where,
  setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';

export default function FriendsModal({ open, onClose, user, dateStr }) {
  const [friends, setFriends] = useState([]);
  const [friendScores, setFriendScores] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [addStatus, setAddStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user || !firebaseConfigured) return;
    loadFriendsAndScores();
  }, [open, user, dateStr]);

  async function loadFriendsAndScores() {
    setLoading(true);
    try {
      const friendsSnap = await getDocs(
        collection(db, 'users', user.uid, 'friends')
      );
      const friendUids = friendsSnap.docs.map(d => d.id);
      setFriends(friendUids);

      // Fetch today's game for each friend
      const scores = [];
      for (const uid of friendUids) {
        const profileSnap = await getDoc(doc(db, 'users', uid));
        const gameSnap = await getDoc(doc(db, 'users', uid, 'games', dateStr));
        if (profileSnap.exists()) {
          const profile = profileSnap.data();
          const game = gameSnap.exists() ? gameSnap.data() : null;
          scores.push({ uid, profile, game });
        }
      }
      setFriendScores(scores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addFriend() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    setAddStatus('Searching…');
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (snap.empty) {
        setAddStatus('No user found with that email.');
        return;
      }
      const friendDoc = snap.docs[0];
      if (friendDoc.id === user.uid) {
        setAddStatus("That's you!");
        return;
      }
      await setDoc(
        doc(db, 'users', user.uid, 'friends', friendDoc.id),
        { addedAt: serverTimestamp() }
      );
      setAddStatus('Friend added!');
      setEmailInput('');
      loadFriendsAndScores();
    } catch (err) {
      setAddStatus('Error adding friend.');
      console.error(err);
    }
  }

  async function removeFriend(uid) {
    await deleteDoc(doc(db, 'users', user.uid, 'friends', uid));
    setFriendScores(prev => prev.filter(f => f.uid !== uid));
  }

  function renderScore(game) {
    if (!game) return <span className="text-gray-400 dark:text-gray-500 text-sm">Not played yet</span>;
    if (game.status === 'gaveUp') return <span className="text-red-500 text-sm">Gave up ❌</span>;
    if (game.status === 'won') {
      const steps = (game.chain?.length || 1) - 1;
      return (
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {steps} step{steps !== 1 ? 's' : ''} ✓
        </span>
      );
    }
    return <span className="text-amber-500 text-sm">In progress…</span>;
  }

  return (
    <Modal open={open} onClose={onClose} title="Friends">
      {!firebaseConfigured || !user ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {!firebaseConfigured
            ? 'Firebase is not configured. Sign in to connect with friends.'
            : 'Sign in with Google to connect with friends!'}
        </p>
      ) : (
        <div className="space-y-5">
          {/* Add friend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add friend by email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setAddStatus(''); }}
                placeholder="friend@example.com"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={e => e.key === 'Enter' && addFriend()}
              />
              <button
                onClick={addFriend}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {addStatus && (
              <p className={`text-xs mt-1 ${addStatus.includes('added') ? 'text-emerald-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {addStatus}
              </p>
            )}
          </div>

          {/* Friend list with today's scores */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Today's Scores
            </h3>
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : friendScores.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No friends yet. Add friends above!
              </p>
            ) : (
              <ul className="space-y-2">
                {friendScores.map(({ uid, profile, game }) => (
                  <li key={uid} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    {profile.photoURL && (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName}
                        className="w-8 h-8 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {profile.displayName}
                      </p>
                      {renderScore(game)}
                    </div>
                    <button
                      onClick={() => removeFriend(uid)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-2"
                      title="Remove friend"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
