import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { records } = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('excel_data').insertMany(records);
    return res.status(201).json({ message: `Inserted ${result.insertedCount} records successfully` });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to insert data', error: err.message });
  }
}
