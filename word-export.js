async function downloadWordReport(button) {
    if (button) { button.disabled = true; button.textContent = 'กำลังสร้างไฟล์ Word…'; }
    try {
        if (!window.docx) throw new Error('ไม่พบเครื่องมือสร้างไฟล์ Word กรุณาโหลดหน้าเว็บใหม่');
        const {Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, PageOrientation} = window.docx;
        const p = (text, options = {}) => new Paragraph({spacing:{after:120},children:[new TextRun({text:String(text ?? ''),font:'Bai Jamjuree',size:22})],...options});
        const cell = (text,width,header=false) => new TableCell({width:{size:width,type:WidthType.DXA},margins:{top:120,bottom:120,left:120,right:120},shading:header?{fill:'E5F1F1'}:undefined,children:String(text??'').split('\n').map(t=>p(t))});
        const table = (headers, rows, widths) => new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows:[new TableRow({tableHeader:true,children:headers.map((h,i)=>cell(h,widths[i],true))}),...rows.map(row=>new TableRow({children:row.map((v,i)=>cell(v,widths[i]))}))]});
        const contents = [p('รายงานการติดตามข้อเสนอแนะด้านฝุ่น PM2.5',{heading:HeadingLevel.TITLE}),p('ส่วนข้อเสนอแนะเพิ่มเติมเป็นร่างเพื่อประกอบการพิจารณา ยังไม่ใช่ฉบับอนุมัติ'),p('ส่วนที่ 1: ผลการติดตามข้อเสนอแนะเดิม',{heading:HeadingLevel.HEADING_1}),table(['ข้อเสนอแนะ / หน่วยงาน','ดำเนินการแล้ว','ประเด็นคงค้าง / ความคืบหน้า'],baselineList.map(i=>[`${i.code}: ${i.title}\n${i.agencies.join(', ')}\n${i.recommendation}`,i.done.join('\n'),`${i.gaps.join('\n')}\nความคืบหน้า ${i.progress}%`]),[4800,4500,4658]),p('ส่วนที่ 2: ร่างข้อเสนอแนะฉบับเพิ่มเติม พ.ศ. 2569',{heading:HeadingLevel.HEADING_1,pageBreakBefore:true}),table(['ระยะเวลา / หัวข้อ','รายละเอียดข้อเสนอแนะ','หน่วยงาน / ที่มา'],additionalList.map(i=>[`${getCategoryMeta(i.category).label}\n${i.title}\n${i.priority}`,i.detail,`${i.agencies}\n${i.ref||''}${i.response?'\nผลการติดตาม: '+i.response:''}`]),[3400,6658,3900])];
        const doc = new Document({creator:'ระบบติดตามข้อเสนอแนะ PM2.5',title:'รายงานติดตามและร่างข้อเสนอแนะเพิ่มเติม',styles:{default:{document:{run:{font:'Bai Jamjuree',size:22}}}},sections:[{properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.LANDSCAPE},margin:{top:1440,bottom:1440,left:1440,right:1440}}},children:contents}]});
        const blob = await Packer.toBlob(doc); const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='รายงาน-PM25-ร่างข้อเสนอแนะเพิ่มเติม.docx';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
        showToast('ดาวน์โหลดรายงาน Word แล้ว');
    } catch (error) { showToast('สร้างไฟล์ Word ไม่สำเร็จ: '+error.message); }
    finally { if(button){button.disabled=false;button.textContent='ดาวน์โหลด Word (.docx)';} }
}
