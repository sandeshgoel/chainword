/**
 * Database abstraction layer.
 *
 * All Firestore access in the app goes through this module so that:
 *  1. Swapping the backend only requires changing this file.
 *  2. Read/write tracking is automatic — no call sites need to import dbTracker.
 *
 * Paths are arrays of alternating collection / document-id segments, exactly
 * mirroring how Firestore organises data:
 *
 *   even-length path → document   ['users', uid] or ['users', uid, 'stats', gameKey]
 *   odd-length path  → collection ['users']       or ['users', uid, 'friends']
 *
 * The tracking label is derived automatically by joining the collection-name
 * segments (even indices) with '/':
 *   ['users', uid]                 → 'users'
 *   ['users', uid, 'stats', key]   → 'users/stats'
 *   ['admin', 'games']             → 'admin'
 */

import {
  doc, collection,
  getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where,
  serverTimestamp, deleteField,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { trackRead, trackWrite } from './dbTracker.js';

// ---- Sentinel values --------------------------------------------------------

/**
 * Use dbTimestamp() in data objects where you want the server to fill in the
 * current timestamp (equivalent to Firestore's serverTimestamp()).
 */
const _TS = Symbol('db.timestamp');
export function dbTimestamp() { return _TS; }

/**
 * Use DB_FIELD_DELETE as a value in dbUpdate() / dbMerge() data to remove a
 * field from the document (equivalent to Firestore's deleteField()).
 */
export const DB_FIELD_DELETE = Symbol('db.field.delete');

// ---- Internal helpers -------------------------------------------------------

/** Derive the tracking label from a path (collection names only, no IDs). */
function _label(path) {
  return path.filter((_, i) => i % 2 === 0).join('/');
}

/** Convert our sentinel values inside a data object to Firestore FieldValues. */
function _convert(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === _TS)             out[k] = serverTimestamp();
    else if (v === DB_FIELD_DELETE) out[k] = deleteField();
    else                       out[k] = v;
  }
  return out;
}

// ---- Single-document reads --------------------------------------------------

/**
 * Read a document. Returns the document data, or null if it does not exist.
 * path must be even-length (points to a document).
 */
export async function dbGet(path) {
  const snap = await getDoc(doc(db, ...path));
  trackRead(_label(path));
  return snap.exists() ? snap.data() : null;
}

// ---- Collection reads -------------------------------------------------------

/**
 * Read every document in a collection.
 * Returns an array of { id, ...data } objects.
 * path must be odd-length (points to a collection).
 */
export async function dbGetAll(path) {
  const snap = await getDocs(collection(db, ...path));
  trackRead(_label(path));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Query a collection for documents where field === value.
 * Returns an array of { id, ...data } objects.
 * path must be odd-length (points to a collection).
 */
export async function dbGetWhere(path, field, value) {
  const q = query(collection(db, ...path), where(field, '==', value));
  const snap = await getDocs(q);
  trackRead(_label(path));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---- Document writes --------------------------------------------------------

/**
 * Create or fully overwrite a document.
 * path must be even-length.
 */
export async function dbSet(path, data) {
  await setDoc(doc(db, ...path), _convert(data));
  trackWrite(_label(path));
}

/**
 * Merge data into a document (creates if absent, leaves untouched fields intact).
 * path must be even-length.
 */
export async function dbMerge(path, data) {
  await setDoc(doc(db, ...path), _convert(data), { merge: true });
  trackWrite(_label(path));
}

/**
 * Partially update an existing document (document must exist).
 * Supports dot-notation keys for nested fields.
 * path must be even-length.
 */
export async function dbUpdate(path, data) {
  await updateDoc(doc(db, ...path), _convert(data));
  trackWrite(_label(path));
}

/**
 * Delete a document.
 * path must be even-length.
 */
export async function dbDelete(path) {
  await deleteDoc(doc(db, ...path));
  trackWrite(_label(path));
}

// ---- Real-time listeners ----------------------------------------------------

/**
 * Subscribe to a single document.
 * cb is called immediately and on every change with (data | null).
 * Returns an unsubscribe function.
 * path must be even-length.
 */
export function dbSubscribeDoc(path, cb, errCb) {
  return onSnapshot(
    doc(db, ...path),
    snap => { trackRead(_label(path)); cb(snap.exists() ? snap.data() : null); },
    errCb,
  );
}

/**
 * Subscribe to a collection.
 * cb is called immediately and on every change with an array of { id, ...data }.
 * Returns an unsubscribe function.
 * path must be odd-length.
 */
export function dbSubscribeCollection(path, cb, errCb) {
  return onSnapshot(
    collection(db, ...path),
    snap => { trackRead(_label(path)); cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))); },
    errCb,
  );
}
