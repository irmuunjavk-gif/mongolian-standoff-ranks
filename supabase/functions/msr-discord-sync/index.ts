const base=Deno.env.get('SUPABASE_URL')!;
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'};
async function db(path:string,init:RequestInit={}){const r=await fetch(base+'/rest/v1/'+path,{...init,headers:{...headers,...init.headers}});if(!r.ok)throw Error('database_'+r.status);const body=await r.text();return body?JSON.parse(body):null;}
const norm=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function parse(content:string){
 const lines=content.replace(/[*\x60]/g,'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const clean=(s:string)=>s.replace(/^[\s#•\-–—:：『』【】<>👑]+|[\s『』【】]+$/gu,'').trim();
 const namePattern=/^(?:(?:clan|team)\s*name|name|team|багийн\s*нэр|баг)\s*[:：=\/\-]\s*(.*)$/i;
 let name='';
 for(let i=0;i<lines.length;i++){const m=clean(lines[i]).match(namePattern);if(m){name=clean(m[1]||lines[i+1]||'');break;}}
 if(!name && lines[0] && !/\d{5,}|https?:|captain|roster|main|sub|бүртгэл|registration/i.test(lines[0])) name=clean(lines[0]);
 const tag=lines.map(s=>clean(s).match(/^(?:(?:clan|team)\s*)?tag\s*[:：=\/\-]\s*(.+)$/i)).find(Boolean)?.[1]?.replace(/[『』\[\]]/g,'').trim()||'';
 if(!name||name.length>100||!norm(name))return null;
 name=name.replace(/[👑亗乂]/gu,'').replace(/\s*\[[^\]]{1,20}\]\s*$/,'').trim();
 const roster:string[]=[]; const player_ids:Record<string,string>={};
 function nickname(prefix:string){
  return clean(prefix)
   .replace(/^(?:\[\s*\]\s*)?(?:(?:team\s*)?captain|main|sub(?:stitute)?s?|player|тоглогч|ахлагч)\s*\d*\s*[:：–—-]?\s*/i,'')
   .replace(/^(?:【\s*\d+\s*】|S?\d{1,2}\s*】|[([]?\d{1,2}[)\].:-])\s*[×x]?\s*/,'')
   .split(/\b(?:iphone|ipad|ip\s*\d|ios|honor|redmi|samsung|poco|rog|realme|lenovo|tecno|infinix|red\s*magic)/i)[0]
   .replace(/^(?:ign)\s*[-:：]?\s*/i,'').replace(/[亗乂]/gu,'').replace(/\s+\d{1,2}\s*(?:pro|max|plus|pm)\b.*$/i,'')
   .replace(/\b[A-Z0-9]{8,}\b/g,s=>/\d/.test(s)&&/[A-Z]/.test(s)?'':s)
   .replace(/[\s–—:/~-]*\bID\s*[:：-]?\s*$/i,'')
   .replace(/[\s–—:/~\-\[\]]+$/g,'').replace(/^[\s–—:/~\-\[\]]+/g,'').trim();
 }
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  const match=line.match(/\b\d{5,12}\b/);
  if(!match)continue;
  let prefix=line.slice(0,match.index);
  const brackets=line.match(/\[([^\]]{1,40})\]\s*\[\d{5,12}\]/);
  if(brackets)prefix=brackets[1];
  else if(/^\s*(?:[-#•~]\s*)?ID\s*[:：-]?\s*$/i.test(prefix)) prefix=lines[i-1]||'';
  const nick=nickname(prefix);
  if(!nick||nick.length>40||/https?:|clan|captain|roster|^main$|^sub$|name\s*:/i.test(nick)||/\d{5,}/.test(nick))continue;
  if(!roster.includes(nick))roster.push(nick); player_ids[nick]=match[0];
 }
 if(roster.length<5||roster.length>12)return null;
 return {name,tag:tag.slice(0,30),name_key:norm(name),roster,player_ids};
}
async function logo(attachments:any[],id:string){
 const a=attachments?.find(a=>['image/png','image/jpeg','image/webp'].includes(a.content_type)&&a.size<=2097152);
 if(!a)return null;
 const u=new URL(a.url);if(u.protocol!=='https:'||u.hostname!=='cdn.discordapp.com'||!u.pathname.startsWith('/attachments/'))return null;
 const r=await fetch(u,{redirect:'error'});if(!r.ok)return null;
 const bytes=await r.arrayBuffer();if(bytes.byteLength>2097152)return null;
 const ext=a.content_type==='image/png'?'png':a.content_type==='image/webp'?'webp':'jpg';
 const path=id+'.'+ext;
 const up=await fetch(base+'/storage/v1/object/team-logos/'+path,{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':a.content_type,'x-upsert':'true'},body:bytes});
 return up.ok?base+'/storage/v1/object/public/team-logos/'+path:null;
}
Deno.serve(async(req)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const states=await db('msr_discord_sync_state?select=token_hash&id=eq.true');
 if(!token||digest!==states[0]?.token_hash)return new Response('Unauthorized',{status:401});
 let imported=0,seen=0,skipped=0;let before='';
 try{
  const bot=Deno.env.get('DISCORD_BOT_TOKEN');if(!bot)throw Error('missing_bot_token');
  const known=await db('msr_discord_teams?select=id,name_key,source_message_id,source_timestamp,player_ids');
  const map=new Map(known.map((x:any)=>[x.name_key,x]));
  for(let page=0;page<10;page++){
   const r=await fetch('https://discord.com/api/v10/channels/1563893301269237812/messages?limit=100'+(before?'&before='+before:''),{headers:{Authorization:'Bot '+bot}});
   if(!r.ok)throw Error('discord_'+r.status);
   const msgs=await r.json();if(!Array.isArray(msgs))throw Error('invalid_discord_response');
   for(const m of msgs){
    seen++;const snapshot=m.message_snapshots?.[0]?.message; const source=snapshot||m; const team=parse(source.content||'');if(!team){skipped++;continue;}
    const prev:any=map.get(team.name_key)||known.find((x:any)=>x.source_message_id===m.id);
    const timestamp=m.edited_timestamp||m.timestamp;
    if(prev && Object.keys(prev.player_ids||{}).length && Date.parse(prev.source_timestamp) >= Date.parse(timestamp)) continue;
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(team.name_key)))).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,24);
    const id=prev?.id||'ds_'+hash;
    const image=await logo(source.attachments||m.attachments,id).catch(()=>null);
    const row={...team,source_message_id:m.id,source_timestamp:timestamp,updated_at:new Date().toISOString(),...(image?{logo_url:image}:{})};
    if(prev)await db('msr_discord_teams?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify(row),headers:{Prefer:'return=minimal'}});
    else await db('msr_discord_teams',{method:'POST',body:JSON.stringify({id,...row}),headers:{Prefer:'return=minimal'}});
    map.set(team.name_key,{id,source_timestamp:timestamp});imported++;
   }
   if(msgs.length<100)break;
   before=msgs[msgs.length-1].id;
  }
  await db('msr_discord_sync_state?id=eq.true',{method:'PATCH',body:JSON.stringify({last_success:new Date().toISOString(),last_status:'ok; scanned='+seen+'; skipped='+skipped,imported}),headers:{Prefer:'return=minimal'}});
  return Response.json({ok:true,imported,scanned:seen,skipped});
 }catch(e){
  console.error('sync_error_type',e?.name); const status=String(e.message).match(/^(missing_bot_token|discord_\d+|database_\d+|invalid_discord_response)$/)?.[0]||'sync_failed';
  await db('msr_discord_sync_state?id=eq.true',{method:'PATCH',body:JSON.stringify({last_status:status}),headers:{Prefer:'return=minimal'}});
  return Response.json({ok:false,error:status},{status:503});
 }
});