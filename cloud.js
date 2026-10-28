// Publishable browser key only. Authorization is enforced by database RLS.
window.pm25Client = supabase.createClient('https://hxljqaukqkpcgesmttpy.supabase.co','sb_publishable_3p08buMZy2UAoLyoVggaXQ_NV5PMtrU',{auth:{storageKey:'pm25-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
window.pm25IsAdmin = false;
window.pm25Revision = 0;
window.pm25PublishedRevision = 0;
function pm25Status(message) { const el=document.getElementById('cloud-status');if(el)el.textContent=message; }
async function pm25CheckAdmin() {
 const {data:{user},error}=await pm25Client.auth.getUser();
 if(error||!user) return false;
 const {data,error:permissionError}=await pm25Client.from('pm25_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 return !permissionError&&!!data;
}
async function pm25Read(kind) {
 const {data,error}=await pm25Client.from('pm25_content').select('payload,revision,updated_at').eq('kind',kind).single();
 if(error)throw error;return data;
}
function pm25Accept(payload) {
 if(!payload||!Array.isArray(payload.baseline)||!Array.isArray(payload.additional))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');
 baselineList=payload.baseline;additionalList=payload.additional;
}
async function pm25Initialize() {
 const admin=document.body.dataset.mode==='admin';
 loadState();
 try {
  if(admin){
   if(!await pm25CheckAdmin()){location.replace('login.html');return;}
   window.pm25IsAdmin=true;
   const draft=await pm25Read('draft');const published=await pm25Read('published');
   window.pm25Revision=draft.revision;window.pm25PublishedRevision=published.revision;
   if(draft.payload)pm25Accept(draft.payload);else if(published.payload)pm25Accept(published.payload);
   pm25Status(draft.payload?'โหลดฉบับทำงานจากฐานข้อมูลแล้ว':'ยังไม่มีฉบับทำงานบนฐานข้อมูล — กดบันทึกฉบับทำงานเพื่อเริ่ม');
   document.body.classList.remove('auth-pending');
  }else{
   const published=await pm25Read('published');if(published.payload)pm25Accept(published.payload);
   pm25Status(published.payload?'ข้อมูลที่ผู้ดูแลเผยแพร่ล่าสุด':'ข้อมูลฉบับที่มาพร้อมหน้าเว็บ');
  }
 }catch(error){
  if(admin){document.getElementById('auth-loading').textContent='เชื่อมต่อระบบไม่ได้ กรุณารีเฟรชหน้าเพื่อทดลองใหม่';return;}
  pm25Status('เชื่อมต่อข้อมูลกลางไม่ได้ กำลังแสดงข้อมูลฉบับที่มาพร้อมเว็บ');
 }
 refreshAllUI();
}
async function pm25SaveDraft(){
 if(!window.pm25IsAdmin||!await pm25CheckAdmin())throw Error('กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล');
 const {data,error}=await pm25Client.from('pm25_content').update({payload:{baseline:baselineList,additional:additionalList},revision:window.pm25Revision+1,updated_at:new Date().toISOString()}).eq('kind','draft').eq('revision',window.pm25Revision).select('revision').maybeSingle();
 if(error)throw Error('บันทึกไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง');
 if(!data)throw Error('ข้อมูลถูกแก้ไขจากอีกหน้าต่างแล้ว กรุณารีเฟรชก่อนแก้ไขต่อ');
 window.pm25Revision=data.revision;pm25Status('บันทึกฉบับทำงานแล้ว • ยังไม่เผยแพร่');
}
async function pm25SaveButton(button){button.disabled=true;try{await pm25SaveDraft();showToast('บันทึกฉบับทำงานแล้ว');}catch(e){showToast(e.message);}finally{button.disabled=false;}}
async function pm25Publish(button){
 if(!confirm('เผยแพร่ข้อมูลที่แสดงอยู่ รวมถึงร่างข้อเสนอแนะเพิ่มเติม ให้ทุกคนที่เปิดเว็บอ่านได้หรือไม่?'))return;
 button.disabled=true;
 try{
  await pm25SaveDraft();
  const {data,error}=await pm25Client.from('pm25_content').update({payload:{baseline:baselineList,additional:additionalList},revision:window.pm25PublishedRevision+1,updated_at:new Date().toISOString()}).eq('kind','published').eq('revision',window.pm25PublishedRevision).select('revision').maybeSingle();
  if(error||!data)throw Error('เผยแพร่ไม่สำเร็จ หรือมีฉบับใหม่จากอีกหน้าต่าง กรุณารีเฟรช');
  window.pm25PublishedRevision=data.revision;pm25Status('เผยแพร่ข้อมูลล่าสุดแล้ว');showToast('เผยแพร่เรียบร้อย ผู้เข้าชมจะเห็นข้อมูลเมื่อเปิดหรือรีเฟรชหน้าเว็บ');
 }catch(e){showToast(e.message);}finally{button.disabled=false;}
}
async function pm25Logout(){await pm25Client.auth.signOut({scope:'local'});location.replace('login.html');}
pm25Client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'&&document.body.dataset.mode==='admin')location.replace('login.html');});
