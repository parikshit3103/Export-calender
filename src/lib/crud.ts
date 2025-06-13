// // lib/crud.ts
// import clientPromise from './mongodb';
// import { ObjectId } from 'mongodb';

// export async function createDocument(collectionName: string, data: any) {
//   const client = await clientPromise;
//   const db = client.db();
  
//   const now = new Date();

//   // Add createdAt and updatedAt timestamps
//   const documentWithTimestamp = {
//     ...data,
//     createdAt: now,
//     updatedAt: now,
//   };

//   return await db.collection(collectionName).insertOne(documentWithTimestamp);
// }
// export async function getDocuments(collectionName: string, page = 1, limit = 10) {
//   const client = await clientPromise;
//   const db = client.db();
//   const skip = (page - 1) * limit;

//   const data = await db.collection(collectionName).find().sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray();
//   const total = await db.collection(collectionName).countDocuments();

//   return {
//     data,
//     currentPage: page,
//     totalPages: Math.ceil(total / limit),
//     totalItems: total
//   };
// }


// export async function updateDocument(collectionName: string, id: string, updateData: any) {
//   const client = await clientPromise;
//   const db = client.db();

//   // ✅ Add updatedAt timestamp
//   return await db
//     .collection(collectionName)
//     .updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           ...updateData,
//           updatedAt: new Date(),
//         },
//       }
//     );
// }

// export async function deleteDocument(collectionName: string, id: string) {
//   const client = await clientPromise;
//   const db = client.db();
//   return await db
//     .collection(collectionName)
//     .deleteOne({ _id: new ObjectId(id) });
// }
