DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
 if(data.attrName==='onclick') data.keepAttr=/^(?:jumpToAgencyTab|selectAgency|openBaselineModal|promoteGapToReiterated|openEditAdditionalModal|deleteAdditionalItem)\('[\p{L}\p{N} ._-]+'\)$|^resetTab1Filters\(\)$|^switchTab\('tab[1-4]'\)$|^setTab3Filter\('[a-z0-9]+'\)$/u.test(data.attrValue);
});
function pm25SafeHTML(html){return DOMPurify.sanitize(html,{ADD_ATTR:['onclick']});}
function pm25SafeTableRows(html){
 const clean=pm25SafeHTML('<table><tbody>'+html+'</tbody></table>');
 const template=document.createElement('template');
 template.innerHTML=clean;
 return template.content.querySelector('tbody')?.innerHTML || '';
}
