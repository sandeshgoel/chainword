import Modal from './Modal.jsx';

function describeDevice(userAgent) {
  if (!userAgent) return 'another device';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'an iPhone/iPad';
  if (/Android/i.test(userAgent)) return 'an Android device';
  if (/Mac/i.test(userAgent)) return 'a Mac';
  if (/Windows/i.test(userAgent)) return 'a Windows PC';
  if (/Linux/i.test(userAgent)) return 'a Linux device';
  return 'another device';
}

export default function SessionConflictModal({ open, sessionConflict, onSignInHere, onCancel }) {
  const device = describeDevice(sessionConflict?.userAgent);

  return (
    <Modal open={open} onClose={onCancel} title="Already Signed In">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You are already signed in on <strong className="text-gray-900 dark:text-white">{device}</strong>.
          What would you like to do?
        </p>
        <div className="space-y-2">
          <button
            onClick={onSignInHere}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Sign in here (sign out from {device})
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm"
          >
            Stay signed in on {device}
          </button>
        </div>
      </div>
    </Modal>
  );
}
