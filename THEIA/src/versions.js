/* STG identities are not Core SemVer: preserve numeric versions and Demo suffixes. */
const gameVersionPattern=/^\d+(?:\.\d+)+(?:-demo(?:\.\d+)?)?$/;
function isGameVersion(value){return typeof value==='string'&&value.length<=64&&value===value.trim()&&gameVersionPattern.test(value);}
/* Core SemVer comparison. Stable is recommended; previews require explicit selection. */
const versionPattern=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
function parseVersion(value){
 const m=String(value).match(versionPattern);if(!m)throw Error('Not SemVer: '+value);
 const pre=m[4]?.split('.')||[];
 if(pre.some(p=>!p||/^\d+$/.test(p)&&p.length>1&&p.startsWith('0')))throw Error('Invalid SemVer prerelease');
 return {core:m.slice(1,4).map(Number),pre};
}
function compareVersions(a,b){
 a=parseVersion(a);b=parseVersion(b);
 for(let i=0;i<3;i++)if(a.core[i]!==b.core[i])return a.core[i]>b.core[i]?1:-1;
 if(!a.pre.length||!b.pre.length)return !a.pre.length&&!b.pre.length?0:!a.pre.length?1:-1;
 for(let i=0;i<Math.max(a.pre.length,b.pre.length);i++){
  const x=a.pre[i],y=b.pre[i];if(x===undefined||y===undefined)return x===undefined?-1:1;if(x===y)continue;
  const xn=/^\d+$/.test(x),yn=/^\d+$/.test(y);if(xn&&yn)return BigInt(x)>BigInt(y)?1:-1;
  if(xn!==yn)return xn?-1:1;return x>y?1:-1;
 }return 0;
}
