
'use server';

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Company, Connection } from '../types';

export async function getEstablishedConnections(companyId: string): Promise<({ connection: Connection; company: Company })[]> {
  // Find connections where the current user's company was the target and the status is 'connected'
  const query1 = query(
    collection(db, 'connections'),
    where('targetCompanyId', '==', companyId),
    where('status', '==', 'connected')
  );

  // Find connections where the current user's company was the requester and the status is 'connected'
  const query2 = query(
    collection(db, 'connections'),
    where('requesterCompanyId', '==', companyId),
    where('status', '==', 'connected')
  );

  const [snapshot1, snapshot2] = await Promise.all([getDocs(query1), getDocs(query2)]);

  const connectionsMap = new Map<string, { connection: Connection; companyId: string }>();

  snapshot1.docs.forEach(doc => {
    const connection = doc.data() as Connection;
    connectionsMap.set(doc.id, { connection, companyId: connection.requesterCompanyId });
  });

  snapshot2.docs.forEach(doc => {
    const connection = doc.data() as Connection;
    connectionsMap.set(doc.id, { connection, companyId: connection.targetCompanyId });
  });

  const establishedConnections = Array.from(connectionsMap.values());

  const companyPromises = establishedConnections.map(async ({ connection, companyId }) => {
    const companyRef = doc(db, 'companies', companyId);
    const companySnap = await getDoc(companyRef);
    if (companySnap.exists()) {
      return { connection, company: companySnap.data() as Company };
    }
    return null;
  });

  const results = await Promise.all(companyPromises);
  
  return results.filter(Boolean) as ({ connection: Connection; company: Company })[];
}
