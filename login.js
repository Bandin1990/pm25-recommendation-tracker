document.getElementById('login-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=document.getElementById('login-submit'),message=document.getElementById('login-message');button.disabled=true;message.textContent='กำลังตรวจสอบบัญชี…';
 try{
  const {error}=await pm25Client.auth.signInWithPassword({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value});
  if(error)throw Error('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจอีเมลและรหัสผ่าน');
  document.getElementById('password').value='';
  if(!await pm25CheckAdmin()){await pm25Client.auth.signOut({scope:'local'});throw Error('บัญชีนี้ไม่มีสิทธิ์จัดการเว็บ PM2.5');}
  location.replace('admin.html');
 }catch(error){message.textContent=error.message;}finally{button.disabled=false;}
});
