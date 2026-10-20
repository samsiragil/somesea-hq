import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const docs=JSON.parse(readFileSync('src/content/documents.json','utf8'));
if(docs.length!==18)throw Error('Harus tersedia 18 dokumen');
for(const doc of docs){const source=resolve('../Somesea-HQ',doc.path);if(!existsSync(source))throw Error(`Sumber hilang: ${doc.path}`);const hash=s=>createHash('sha256').update(s).digest('hex');if(hash(readFileSync(source,'utf8'))!==hash(doc.content))throw Error(`Isi berbeda: ${doc.path}`);}
console.log('18/18 dokumen cocok SHA-256 dengan sumber bisnis.');
