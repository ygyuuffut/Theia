/* Render a small Markdown subset with DOM text nodes. Release HTML is never executed. */
const TheiaNotes = (()=>{
 const imageHosts=new Set(['raw.githubusercontent.com','github.com','user-images.githubusercontent.com']);
 function url(value,base,image=false){
  try{const u=new URL(value,base);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(!image||imageHosts.has(u.hostname))?u.href:null;}catch{return null;}
 }
 function render(target,text,{repository='ygyuuffut/Synodic',tag='main'}={}){
  target.replaceChildren();
  const base='https://github.com/'+repository+'/blob/'+encodeURIComponent(tag)+'/',imageBase='https://raw.githubusercontent.com/'+repository+'/'+encodeURIComponent(tag)+'/';
  let images=0;
  function picture(parent,alt,source){
   const src=url(source,imageBase,true);if(!src||images++>=8){parent.append(document.createTextNode(alt));return;}
   const image=document.createElement('img');image.src=src;image.alt=alt;image.loading='lazy';image.referrerPolicy='no-referrer';
   image.addEventListener('error',()=>{image.replaceWith(document.createTextNode(alt||'Release image unavailable.'));},{once:true});parent.append(image);
  }
  function inline(parent,value){
   const tokens=/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|<img\b[^>]*>/gi;
   let at=0;for(const match of value.matchAll(tokens)){
    parent.append(document.createTextNode(value.slice(at,match.index)));at=match.index+match[0].length;
    if(match[1]!==undefined){picture(parent,match[1],match[2]);continue;}
    if(match[3]!==undefined){const href=url(match[4],base);if(href){const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=match[3];parent.append(a);}else parent.append(document.createTextNode(match[3]));continue;}
    if(match[5]!==undefined||match[6]!==undefined){const e=document.createElement(match[5]!==undefined?'code':'strong');e.textContent=match[5]??match[6];parent.append(e);continue;}
    const src=match[0].match(/\bsrc\s*=\s*(["'])(.*?)\1/i),alt=match[0].match(/\balt\s*=\s*(["'])(.*?)\1/i);
    if(src)picture(parent,alt?.[2]||'Release image',src[2]);else parent.append(document.createTextNode(match[0]));
   }parent.append(document.createTextNode(value.slice(at)));
  }
  const source=typeof text==='string'?text.slice(0,128*1024):'';
  let paragraph=[],code=null,list=null;
  function flush(){if(paragraph.length){const p=document.createElement('p');inline(p,paragraph.join(' '));target.append(p);paragraph=[];}list=null;}
  for(const line of source.split(/\r?\n/)){
   if(line.startsWith('```')){flush();if(code){const p=document.createElement('pre'),c=document.createElement('code');c.textContent=code.join('\n');p.append(c);target.append(p);code=null;}else code=[];continue;}
   if(code){code.push(line);continue;}
   if(!line.trim()){flush();continue;}
   const heading=line.match(/^#{1,6}\s+(.+)$/);if(heading){flush();const h=document.createElement('h3');inline(h,heading[1]);target.append(h);continue;}
   const item=line.match(/^\s*[-*]\s+(.+)$/);if(item){if(paragraph.length)flush();if(!list){list=document.createElement('ul');target.append(list);}const li=document.createElement('li');inline(li,item[1]);list.append(li);continue;}
   paragraph.push(line.trim());
  }
  flush();if(code){const p=document.createElement('pre');p.textContent=code.join('\n');target.append(p);}
  if(!target.childNodes.length){const p=document.createElement('p');p.textContent='No release notes were provided.';target.append(p);}
 }
 return {render};
})();
