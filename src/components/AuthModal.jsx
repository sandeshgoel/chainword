import Modal from './Modal.jsx';
import { firebaseConfigured } from '../firebase.js';

export default function AuthModal({ open, onClose, user, userProfile, onSignIn, onSignOut }) {
  return (
    <Modal open={open} onClose={onClose} title={user ? 'Account' : 'Sign In'}>
      {!firebaseConfigured ? (
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            Google Sign-In is not configured yet. To enable it, set up a Firebase project
            and add the environment variables to <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code>.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            See <code>src/firebase.js</code> for setup instructions.
          </p>
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <div className="relative inline-block">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className={`w-12 h-12 rounded-full ${userProfile?.paid ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''}`}
                  referrerPolicy="no-referrer"
                />
                {userProfile?.admin && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your game progress is being saved to the cloud.
          </p>
          <button
            onClick={() => { onSignOut(); onClose(); }}
            className="w-full py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to save your progress to the cloud and compete with friends!
          </p>
          <button
            onClick={() => { onSignIn(); onClose(); }}
            className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Without signing in, progress is saved locally on this device.
          </p>
        </div>
      )}
    </Modal>
  );
}
