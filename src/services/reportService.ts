import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ReportDocument } from '../types/firebaseModels';

const REPORTS_COL = 'reports';

export async function submitPropertyReport(
  data: Omit<ReportDocument, 'reportId' | 'status' | 'createdAt'>
): Promise<ReportDocument> {
  const colRef = collection(db, REPORTS_COL);
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const report: ReportDocument = {
    ...data,
    reportId: newDocRef.id,
    status: 'pending',
    createdAt: now
  };

  await setDoc(newDocRef, report);
  return report;
}

export async function fetchAllReports(): Promise<ReportDocument[]> {
  try {
    const q = query(collection(db, REPORTS_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ReportDocument);
  } catch {
    return [];
  }
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
  const ref = doc(db, REPORTS_COL, reportId);
  await updateDoc(ref, {
    status,
    resolvedAt: new Date().toISOString()
  });
}

/** Alias used by PropertyDetailsPage */
export const submitReport = submitPropertyReport;
