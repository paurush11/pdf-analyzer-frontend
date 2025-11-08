// // src/features/uploads/UploadDropzone.tsx
// 'use client';

// import { useCallback, useState } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Paper, Text, Progress, Button, Group, Code, Stack } from '@mantine/core';
// import { useMultipartUpload } from './useMultipartUpload';

// type Item = {
//     file: File;
//     id: string;         // display id (e.g., file.name + size)
// };

// export default function UploadDropzone() {
//     const [queue, setQueue] = useState<Item[]>([]);
//     const { state, uploadFile, cancel, reset } = useMultipartUpload({ concurrency: 6, maxRetries: 3 });

//     const onDrop = useCallback((accepted: File[]) => {
//         const items = accepted.map((f) => ({ file: f, id: `${f.name}:${f.size}` }));
//         setQueue((prev) => [...prev, ...items]);
//     }, []);

//     const startNext = useCallback(async () => {
//         if (!queue.length) return;
//         const [head, ...rest] = queue;
//         setQueue(rest);
//         try {
//             await uploadFile(head.file);
//             // if more queued, continue automatically
//             if (rest.length) startNext();
//         } catch {
//             // keep the remaining queue as-is; user can retry
//         }
//     }, [queue, uploadFile]);

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

//     const busy = state.status === 'preparing' || state.status === 'uploading' || state.status === 'completing';

//     return (
//         <Stack gap= "md" >
//         <Paper withBorder p = "lg" {...getRootProps() } style = {{ cursor: 'pointer' }
// }>
//     <input { ...getInputProps() } />
//     <Text fw={ 600 } mb = "xs" >
//         { isDragActive? 'Drop files…': 'Drag & drop files here, or click to select' }
//         </Text>
//         < Text c = "dimmed" size = "sm" >
//             Large files are uploaded in parallel parts with retry & resume - safe server logic.
//         </Text>
//                 </Paper>

// {/* Current upload state */ }
// <Paper withBorder p = "md" >
//     <Text fw={ 600 } mb = "xs" > Current upload </Text>
// { state.status === 'idle' && <Text size="sm" c = "dimmed" > No active upload </Text> }

// { state.status === 'preparing' && <Text size="sm" > Preparing session…</Text> }

// {
//     state.status === 'uploading' && (
//         <>
//         <Progress value={ state.progressPct } />
//             < Group justify = "space-between" mt = "xs" >
//                 <Text size="sm" > { state.progressPct } % </Text>
//                     < Text size = "sm" >
//                         { Math.round(state.uploadedBytes / (1024 * 1024)) } / { Math.round(state.totalBytes / (1024 * 1024)) } MB
//                             </Text>
//                             </Group>
//                             < Group mt = "sm" >
//                                 <Button variant="light" color = "red" onClick = { cancel } > Cancel </Button>
//                                     </Group>
//                                     </>
//         )
// }

// { state.status === 'completing' && <Text size="sm" > Finalizing upload…</Text> }

// {
//     state.status === 'done' && (
//         <Group justify="space-between" >
//             <Text size="sm" c = "green" > Completed </Text>
//                 < Code > { state.fileId } </Code>
//                 < Button variant = "light" onClick = { reset } > Reset </Button>
//                     </Group>
//         )
// }

// {
//     state.status === 'error' && (
//         <Group justify="space-between" >
//             <Text size="sm" c = "red" > Error: { state.message } </Text>
//                 < Button variant = "light" onClick = { startNext } > Retry </Button>
//                     </Group>
//         )
// }
// </Paper>

// {/* Queue */ }
// <Paper withBorder p = "md" >
//     <Group justify="space-between" mb = "xs" >
//         <Text fw={ 600 }> Queue({ queue.length }) </Text>
//             < Group >
//             <Button disabled={ busy || queue.length === 0 } onClick = { startNext } >
//                 { busy? 'Working…': 'Start' }
//                 </Button>
//                 < Button variant = "light" disabled = { busy || queue.length === 0} onClick = {() => setQueue([])}>
//                     Clear
//                     </Button>
//                     </Group>
//                     </Group>
// {
//     queue.length === 0 ? (
//         <Text size= "sm" c = "dimmed" > No files queued </Text>
//         ) : (
//         <Stack gap= { 4} >
//         {
//             queue.map((it) => (
//                 <Group key= { it.id } justify = "space-between" >
//                 <Text size="sm" > { it.file.name } </Text>
//             < Text size = "sm" c = "dimmed" >
//             { Math.round(it.file.size / (1024 * 1024)) } MB
//             </Text>
//             </Group>
//             ))
//         }
//         </Stack>
//         )
// }
// </Paper>
//     </Stack>
//   );
// }
