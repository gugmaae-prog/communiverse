export function workshopEnquiryMail(values){
 const labels={'aura-painting':'Aura painting with Sophiko','guided-meditation':'Guided meditation with Luna',both:'Both workshops',help:'Help me choose'},session=labels[values.session]||labels.help;
 const body=['Hello Communiverse,','',"I’d like to plan an office workshop.",'','Workshop: '+session,'Company or team: '+String(values.company||''),'Number of people: '+String(values.size||''),'Preferred date: '+String(values.date||'Flexible'),'Office location in Dubai: '+String(values.location||''),'','Notes: '+String(values.notes||'None yet.'),'','Please share availability, format and pricing.'].join('\n');
 return 'mailto:hello@communiverseclubs.com?subject='+encodeURIComponent('Corporate workshop enquiry — '+session)+'&body='+encodeURIComponent(body);
}
