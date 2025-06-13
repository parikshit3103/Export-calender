// import { NextApiRequest, NextApiResponse } from 'next';
// import {
//   createDocument,
//   getDocuments,
//   updateDocument,
//   deleteDocument,
// } from '@/lib/crud';
// import formidable from 'formidable';
// import fs from 'fs';

// export const config = {
//   api: {
//     bodyParser: false, // Disable built-in body parsing
//   },
// };

// async function parseRequest(req: NextApiRequest): Promise<{ fields: any; files?: any }> {
//   const contentType = req.headers['content-type'];
  
//   if (contentType?.startsWith('application/json')) {
//     return new Promise((resolve) => {
//       let body = '';
//       req.on('data', (chunk) => {
//         body += chunk.toString();
//       });
//       req.on('end', () => {
//         resolve({ fields: JSON.parse(body) });
//       });
//     });
//   }
  
//   if (contentType?.startsWith('multipart/form-data')) {
//     return new Promise((resolve, reject) => {
//       const form = formidable({ multiples: false });
//       form.parse(req, (err, fields, files) => {
//         if (err) reject(err);
//         resolve({ fields, files });
//       });
//     });
//   }

//   return { fields: req.body };
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { collection } = req.query;
//   const collectionName = Array.isArray(collection) ? collection[0] : collection;

//   if (!collectionName) {
//     return res.status(400).json({ message: 'Collection name is required' });
//   }

//   try {
//     // Handle POST requests (create)
//     if (req.method === 'POST') {
//       const { fields, files } = await parseRequest(req);
      
//       let documentData = fields;
      
//       if (files?.image) {
//         const imageFile = files.image[0];
//         const imageBuffer = fs.readFileSync(imageFile.filepath);
        
//         documentData = {
//           ...fields,
//           image: {
//             data: imageBuffer,
//             contentType: imageFile.mimetype,
//             filename: imageFile.originalFilename,
//           }
//         };
//         fs.unlinkSync(imageFile.filepath);
//       }

//       const result = await createDocument(collectionName, documentData);
//       return res.status(201).json(result);
//     }

//     // Handle PUT requests (update)
//     if (req.method === 'PUT') {
//       const { fields, files } = await parseRequest(req);
      
//       let updateData = fields;
      
//       if (files?.image) {
//         const imageFile = files.image[0];
//         const imageBuffer = fs.readFileSync(imageFile.filepath);
        
//         updateData = {
//           ...fields,
//           image: {
//             data: imageBuffer,
//             contentType: imageFile.mimetype,
//             filename: imageFile.originalFilename,
//           }
//         };
//         fs.unlinkSync(imageFile.filepath);
//       }

//       // Ensure _id is provided for updates
//       if (!updateData._id) {
//         return res.status(400).json({ message: '_id is required for updates' });
//       }

//       const { _id, ...dataToUpdate } = updateData;
//       const result = await updateDocument(collectionName, _id, dataToUpdate);
//       return res.status(200).json(result);
//     }

//     // ... rest of your handlers (GET, DELETE)
//     if (req.method === 'GET') {
//       const { page = '1', limit = '10' } = req.query;
//       const result = await getDocuments(collectionName, +page, +limit);
//       return res.status(200).json(result);
//     }

//     if (req.method === 'DELETE') {
//       const { id } = req.query;
//       const result = await deleteDocument(collectionName, id as string);
//       return res.status(200).json(result);
//     }

//     return res.status(405).json({ message: 'Method Not Allowed' });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Internal Server Error', error: err });
//   }
// }