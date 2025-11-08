// // src/features/uploads/useMultipartUpload.ts
// 'use client';

// import pLimit from 'p-limit';
// import { useMemo, useRef, useState } from 'react';
// // import { backend } from '@/api/generated';

// type PartAck = { partNumber: number; etag: string; size: number };

// export type UploadState =
//     | { status: 'idle' }
//     | { status: 'preparing' }
//     | { status: 'uploading'; progressPct: number; uploadedBytes: number; totalBytes: number }
//     | { status: 'completing' }
//     | { status: 'done'; fileId: string }
//     | { status: 'error'; message: string };

// export type UseMultipartUploadOptions = {
//     concurrency?: number;   // default 6
//     maxRetries?: number;    // per part, default 3
// };

// export function useMultipartUpload(opts: UseMultipartUploadOptions = {}) {
//     const concurrency = opts.concurrency ?? 6;
//     const maxRetries = opts.maxRetries ?? 3;

//     const [state, setState] = useState<UploadState>({ status: 'idle' });
//     const abortRef = useRef<AbortController | null>(null);

//     const limiter = useMemo(() => pLimit(concurrency), [concurrency]);

//     const reset = () => setState({ status: 'idle' });

//     const cancel = () => {
//         abortRef.current?.abort();
//         setState({ status: 'error', message: 'Upload cancelled' });
//     };

//     const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

//     async function putWithRetry(url: string, blob: Blob, signal: AbortSignal) {
//         let attempt = 0;
//         // simple backoff: 300ms, 600ms, 1200ms...
//         while (true) {
//             try {
//                 const res = await fetch(url, { method: 'PUT', body: blob, signal });
//                 if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
//                 // some S3 proxies return ETag quoted; normalize
//                 const etag = (res.headers.get('etag') || '').replaceAll('"', '');
//                 return etag;
//             } catch (err) {
//                 attempt++;
//                 if (signal.aborted) throw err;
//                 if (attempt > maxRetries) throw err;
//                 await sleep(300 * 2 ** (attempt - 1));
//             }
//         }
//     }

//     async function uploadFile(file: File) {
//         try {
//             abortRef.current?.abort(); // cancel any previous upload
//             abortRef.current = new AbortController();
//             const { signal } = abortRef.current;

//             setState({ status: 'preparing' });

//             // 1) create session
//             const { data: session } = await backend.createUploadSession({
//                 body: {
//                     filename: file.name,
//                     size: file.size,
//                     contentType: file.type || 'application/octet-stream',
//                 },
//             });

//             const partSize = session.partSize; // bytes per part (decided server-side)
//             let uploadedBytes = 0;

//             const updateProgress = (delta: number) => {
//                 uploadedBytes += delta;
//                 setState({
//                     status: 'uploading',
//                     uploadedBytes,
//                     totalBytes: file.size,
//                     progressPct: Math.min(100, Math.round((uploadedBytes / file.size) * 100)),
//                 });
//             };

//             // helper to upload a batch of presigned parts
//             const uploadBatch = async (batch: { partNumber: number; url: string }[]): Promise<PartAck[]> => {
//                 const out: PartAck[] = [];
//                 await Promise.all(
//                     batch.map(({ partNumber, url }) =>
//                         limiter(async () => {
//                             const start = (partNumber - 1) * partSize;
//                             const end = Math.min(start + partSize, file.size);
//                             const blob = file.slice(start, end);
//                             const etag = await putWithRetry(url, blob, signal);
//                             updateProgress(blob.size);
//                             out.push({ partNumber, etag, size: blob.size });
//                         })
//                     )
//                 );
//                 out.sort((a, b) => a.partNumber - b.partNumber);
//                 return out;
//             };

//             // 2) upload first batch
//             let allAcks: PartAck[] = await uploadBatch(session.presignedParts);

//             // 3) continue fetching next batches if server paginates presigned URLs
//             let nextToken = session.nextBatchToken;
//             while (nextToken && !signal.aborted) {
//                 const { data: next } = await backend.getNextPresignedParts({
//                     fileId: session.fileId,
//                     query: { token: nextToken },
//                 });
//                 const acks = await uploadBatch(next.presignedParts);
//                 allAcks = allAcks.concat(acks);
//                 nextToken = next.nextBatchToken;
//             }

//             if (signal.aborted) throw new Error('aborted');

//             // 4) report uploaded parts (idempotent on server)
//             await backend.reportParts({ fileId: session.fileId, body: { parts: allAcks } });

//             // 5) complete
//             setState({ status: 'completing' });
//             await backend.completeUpload({ fileId: session.fileId });

//             setState({ status: 'done', fileId: session.fileId });
//             return { fileId: session.fileId };
//         } catch (e: any) {
//             if (e?.name === 'AbortError') {
//                 setState({ status: 'error', message: 'Upload cancelled' });
//             } else {
//                 setState({ status: 'error', message: e?.message || 'Upload failed' });
//             }
//             throw e;
//         }
//     }

//     return { state, uploadFile, cancel, reset };
// }
