/* The local installer never executes package code in its own context. */
const LIMITS = Object.freeze({game:64*1024*1024,zip:16*1024*1024,unpacked:24*1024*1024,entries:32,manifest:256*1024});
const HASH=/^[a-f0-9]{64}$/;
function insist(ok,message){if(!ok)throw Error(message);}
function plain(value){return value&&typeof value==='object'&&!Array.isArray(value);}
function pathAllowed(name){return typeof name==='string'&&name.length<=160&&!name.includes('\\')&&!name.includes(':')&&!name.startsWith('/')&&!name.includes('\0')&&name.split('/').every(p=>p&&p!=='.'&&p!=='..')&&!name.split('/').some(p=>['__proto__','prototype','constructor'].includes(p));}
function validateManifest(m){
 insist(plain(m)&&m.schema_version===1&&m.kind==='synodic-core'&&!m.proposal,'Unsupported Core manifest');
 insist(typeof m.release_version==='string','Missing Core version');parseVersion(m.release_version);
 insist(['stable','rc','beta','legacy'].includes(m.channel),'Unsupported release channel');
 insist((m.channel==='stable'||m.channel==='legacy')===!parseVersion(m.release_version).pre.length || m.channel==='legacy','Release channel/version mismatch');
 insist(m.injection_contract==='synodic-python-text-v1','Unsupported injection contract');
 insist(Array.isArray(m.games)&&m.games.length>0&&m.games.length<=32,'Missing game compatibility');
 const gameKeys=new Set();for(const g of m.games){insist(plain(g)&&isGameVersion(g.version)&&!gameKeys.has(g.version),'Invalid or duplicate game version');gameKeys.add(g.version);insist(Array.isArray(g.raw_sha256)&&g.raw_sha256.length>0&&g.raw_sha256.length<=32&&g.raw_sha256.every(h=>HASH.test(h)&&!/^(0){64}$/.test(h)),'Known original game fingerprints required');}
 insist(Array.isArray(m.components)&&m.components.length===2,'LUNAR and MOONSHINE must be paired');
 const componentIDs=m.components.map(c=>c.id);insist(new Set(componentIDs).size===2&&componentIDs.includes('lunar')&&componentIDs.includes('moonshine'),'Only public paired Core is supported');
 insist(m.payload_path==='payload.json','Unsupported payload path');
 insist(Array.isArray(m.files)&&m.files.length>0&&m.files.length<=LIMITS.entries,'Missing integrity inventory');
 const paths=new Set();let total=0;for(const f of m.files){insist(plain(f)&&pathAllowed(f.path)&&f.path!=='manifest.json'&&!paths.has(f.path),'Invalid or duplicate file path');paths.add(f.path);insist(Number.isSafeInteger(f.size)&&f.size>=0&&f.size<=LIMITS.unpacked&&HASH.test(f.sha256),'Invalid file integrity metadata');total+=f.size;}
 insist(total<=LIMITS.unpacked&&paths.has('payload.json'),'Package size exceeds limit');
 return m;
}
function inspectZip(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),u16=p=>view.getUint16(p,true),u32=p=>view.getUint32(p,true);
 insist(bytes.length>=22&&bytes.length<=LIMITS.zip,'ZIP exceeds the supported size limit');
 let end=-1;for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(u32(p)===0x06054b50&&p+22+u16(p+20)===bytes.length){end=p;break;}
 insist(end>=0,'Incomplete ZIP archive');
 const entries=u16(end+10),size=u32(end+12),offset=u32(end+16);
 insist(u16(end+4)===0&&u16(end+6)===0&&u16(end+8)===entries&&entries>0&&entries<=LIMITS.entries&&entries!==0xffff&&offset!==0xffffffff&&size!==0xffffffff,'Split/ZIP64 archive is unsupported');
 insist(offset+size===end,'Unexpected ZIP directory or trailing data');
 const rows=[],names=new Set();let p=offset,total=0;
 for(let i=0;i<entries;i++){
  insist(p+46<=end&&u32(p)===0x02014b50,'Invalid ZIP directory');
  const flags=u16(p+8),method=u16(p+10),packed=u32(p+20),unpacked=u32(p+24),nl=u16(p+28),xl=u16(p+30),cl=u16(p+32),local=u32(p+42);
  insist(p+46+nl+xl+cl<=end&&!(flags&1)&&!(flags&0x40)&&(method===0||method===8)&&u16(p+34)===0,'Unsupported or encrypted ZIP entry');
  const name=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(p+46,p+46+nl));
  insist(pathAllowed(name)&&!names.has(name),'Unsafe or duplicate ZIP path');names.add(name);
  const unixMode=u32(p+38)>>>16;insist((unixMode&0xf000)!==0xa000&&!name.endsWith('/'),'Symlinks/directories are unsupported');
  insist(packed!==0xffffffff&&unpacked!==0xffffffff&&local!==0xffffffff&&unpacked<=LIMITS.unpacked,'ZIP64/oversized entry unsupported');total+=unpacked;insist(total<=LIMITS.unpacked,'ZIP expansion exceeds limit');
  let extra=p+46+nl;while(extra<p+46+nl+xl){insist(extra+4<=p+46+nl+xl,'Invalid ZIP extra data');const id=u16(extra),length=u16(extra+2);insist(id!==1&&extra+4+length<=p+46+nl+xl,'ZIP64/invalid extra data unsupported');extra+=4+length;}
  insist(local+30<=offset&&u32(local)===0x04034b50,'Invalid local ZIP entry');
  const lnl=u16(local+26),lxl=u16(local+28),dataStart=local+30+lnl+lxl;
  insist(dataStart+packed<=offset&&u16(local+6)===flags&&u16(local+8)===method,'ZIP entry header mismatch');
  insist(new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(local+30,local+30+lnl))===name,'ZIP path header mismatch');
  rows.push({name,packed,unpacked,crc:u32(p+16),local,dataStart,dataEnd:dataStart+packed});p+=46+nl+xl+cl;
 }
 insist(p===end&&names.has('manifest.json')&&names.has('payload.json'),'Incomplete Core package');
 const ranges=[...rows].sort((a,b)=>a.local-b.local);for(let i=1;i<ranges.length;i++)insist(ranges[i].local>=ranges[i-1].dataEnd,'Overlapping ZIP entries');
 insist(rows.find(r=>r.name==='manifest.json').unpacked<=LIMITS.manifest,'Manifest exceeds limit');
 return rows;
}
function validatePayload(payload){
 insist(plain(payload)&&payload.schema===1&&payload.kind==='SYNODIC-compiled-core','Unsupported compiled Core');
 insist(Array.isArray(payload.head)&&Array.isArray(payload.body)&&plain(payload.blocks)&&Array.isArray(payload.nativeImportFamilies),'Incomplete Core payload');
 const names=[...payload.head,...payload.body,'BOOTSTRAP'];insist(names.length<=256&&new Set(names).size===names.length&&Object.keys(payload.blocks).length===names.length,'Duplicate/unlisted injection blocks');
 for(const name of names)insist(/^[A-Z-]+$/.test(name)&&!name.includes('HECATE')&&typeof payload.blocks[name]==='string'&&!/<!-- STG-[A-Z-]+:(?:START|END) -->|<tw-storydata\b|\bid=["'](?:hecate\.|HECATE-|lunar\.api\.hecate)/i.test(payload.blocks[name]),'Unsafe injection block');
 insist(payload.nativeImportFamilies.every(f=>typeof f==='string'&&f.length<=80),'Invalid font configuration');
 const scripts=names.flatMap(name=>[...payload.blocks[name].matchAll(/<script\b[^>]*\bid=["']([^"']+)["']/g)].map(m=>m[1]));
 insist(scripts.some(s=>s.startsWith('lunar.'))&&scripts.some(s=>s.startsWith('moonshine.'))&&!scripts.includes('lunar.api.hecate')&&new Set(scripts).size===scripts.length,'Public paired Core modules required');
 for(const name of ['LUNAR-FONT-RESOURCES','LUNAR-DIAGNOSTIC-CONFIG','LUNAR-ASSET-MANIFEST','LUNAR-MOD-CATALOG'])insist(names.includes(name),'Missing Core configuration');
 const catalog=payload.blocks['LUNAR-MOD-CATALOG'].match(/id="LUNAR-mod-catalog">([\s\S]*?)<\/script>/);
 insist(catalog&&JSON.parse(catalog[1]).length===2&&JSON.parse(catalog[1]).map(c=>c.id).sort().join(',')==='lunar,moonshine','Private addon in Core catalog');
 return payload;
}
// Bound actual inflation too: directory sizes can be forged in a hostile local ZIP.
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function extractBounded(entry,row){return new Promise((resolve,reject)=>{
 let count=0,crc=0xffffffff,failed=false;const chunks=[],stream=entry.internalStream('uint8array');
 function fail(error){if(failed)return;failed=true;stream.pause();reject(error);}
 stream.on('data',chunk=>{if(failed)return;count+=chunk.length;if(count>row.unpacked){fail(Error('ZIP expanded beyond declared size: '+row.name));return;}for(const b of chunk)crc=crcTable[(crc^b)&255]^(crc>>>8);chunks.push(chunk);});
 stream.on('error',fail);stream.on('end',()=>{if(failed)return;if(count!==row.unpacked||((crc^0xffffffff)>>>0)!==row.crc){fail(Error('ZIP size/CRC mismatch: '+row.name));return;}const result=new Uint8Array(count);let at=0;for(const chunk of chunks){result.set(chunk,at);at+=chunk.length;}resolve(result);});stream.resume();
});}
async function verifyPackage(bytes,{zipHash=null,manifestText=null,releaseVersion=null}={}){
 const rows=inspectZip(bytes),actualZipHash=await sha256(bytes);
 if(zipHash)insist(HASH.test(zipHash)&&actualZipHash===zipHash,'Core ZIP SHA-256 mismatch');
 const archive=await JSZip.loadAsync(bytes,{checkCRC32:false,createFolders:false});
 insist(Object.keys(archive.files).length===rows.length,'ZIP inventory changed during extraction');
 const manifestBytes=await extractBounded(archive.file('manifest.json'),rows.find(r=>r.name==='manifest.json'));
 const innerText=new TextDecoder('utf-8',{fatal:true}).decode(manifestBytes);
 if(manifestText!==null)insist(innerText===manifestText,'External/internal Manifest mismatch');
 const manifest=validateManifest(JSON.parse(innerText));if(releaseVersion)insist(manifest.release_version===releaseVersion,'Release/package version mismatch');
 const expectedNames=new Set(['manifest.json',...manifest.files.map(f=>f.path)]);insist(expectedNames.size===rows.length&&rows.every(r=>expectedNames.has(r.name)),'Unlisted ZIP files');
 let payloadBytes;for(const file of manifest.files){const row=rows.find(r=>r.name===file.path);insist(row&&row.unpacked===file.size,'File size mismatch: '+file.path);const data=await extractBounded(archive.file(file.path),row);insist(data.length===file.size&&await sha256(data)===file.sha256,'File SHA-256 mismatch: '+file.path);if(file.path==='payload.json')payloadBytes=data;}
 const payload=validatePayload(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(payloadBytes)));
 return {manifest,payload,zipHash:actualZipHash,manifestHash:await sha256(manifestBytes),originVerified:!!zipHash};
}
