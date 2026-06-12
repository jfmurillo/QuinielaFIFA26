"use client";

import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./client";
import type { Match, Pool, Prediction, UserProfile } from "@/lib/types";

// --------------------------------------------------------------------------
// Usuarios
// --------------------------------------------------------------------------
export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  const db = getDb();
  await setDoc(
    doc(db, "users", profile.uid),
    { ...profile },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// --------------------------------------------------------------------------
// Quinielas (pools)
// --------------------------------------------------------------------------
function randomCode(len = 6): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createPool(name: string, owner: UserProfile): Promise<Pool> {
  const db = getDb();
  const pool: Omit<Pool, "id"> = {
    name: name.trim(),
    code: randomCode(),
    ownerUid: owner.uid,
    createdAt: Date.now(),
    memberUids: [owner.uid],
  };
  const ref = await addDoc(collection(db, "pools"), pool);
  return { id: ref.id, ...pool };
}

export async function joinPoolByCode(code: string, uid: string): Promise<Pool> {
  const db = getDb();
  const q = query(
    collection(db, "pools"),
    where("code", "==", code.trim().toUpperCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No existe una quiniela con ese codigo.");

  const d = snap.docs[0];
  const pool = { id: d.id, ...(d.data() as Omit<Pool, "id">) };
  if (!pool.memberUids.includes(uid)) {
    await updateDoc(doc(db, "pools", d.id), {
      memberUids: [...pool.memberUids, uid],
    });
    pool.memberUids.push(uid);
  }
  return pool;
}

export function listenUserPools(uid: string, cb: (pools: Pool[]) => void): Unsubscribe {
  const db = getDb();
  const q = query(collection(db, "pools"), where("memberUids", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Pool, "id">) })));
  });
}

export async function getPool(poolId: string): Promise<Pool | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "pools", poolId));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Pool, "id">) } : null;
}

export async function leavePool(poolId: string, uid: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "pools", poolId), { memberUids: arrayRemove(uid) });
}

export async function deletePool(poolId: string, uid: string): Promise<void> {
  const db = getDb();
  const poolRef = doc(db, "pools", poolId);
  const snap = await getDoc(poolRef);
  if (!snap.exists()) return;
  const pool = snap.data() as Omit<Pool, "id">;
  if (pool.ownerUid !== uid) throw new Error("Solo el organizador puede eliminar la quiniela.");
  const predsSnap = await getDocs(collection(db, "pools", poolId, "predictions"));
  await Promise.all(predsSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(poolRef);
}

// --------------------------------------------------------------------------
// Partidos
// --------------------------------------------------------------------------
export function listenMatches(cb: (matches: Match[]) => void): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, "matches"), (snap) => {
    const matches = snap.docs.map((d) => d.data() as Match);
    matches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
    cb(matches);
  });
}

// --------------------------------------------------------------------------
// Predicciones
// --------------------------------------------------------------------------
function predId(uid: string, matchId: string): string {
  return `${uid}_${matchId}`;
}

export async function savePrediction(
  poolId: string,
  uid: string,
  matchId: string,
  homeGoals: number,
  awayGoals: number
): Promise<void> {
  const db = getDb();
  const id = predId(uid, matchId);
  const data: Prediction = {
    id,
    poolId,
    uid,
    matchId,
    homeGoals,
    awayGoals,
    points: null,
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, "pools", poolId, "predictions", id), {
    ...data,
    serverUpdatedAt: serverTimestamp(),
  });
}

export function listenPoolPredictions(
  poolId: string,
  cb: (preds: Prediction[]) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(collection(db, "pools", poolId, "predictions"), (snap) => {
    cb(snap.docs.map((d) => d.data() as Prediction));
  });
}

export function listenMyPredictions(
  poolId: string,
  uid: string,
  cb: (preds: Prediction[]) => void
): Unsubscribe {
  const db = getDb();
  const q = query(collection(db, "pools", poolId, "predictions"), where("uid", "==", uid));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.data() as Prediction));
  });
}
