// Public intake questions. Internal commercial terms and unconfirmed claims stay out of this flow.
export const applicationFlows = {
  ambassador: {
    title: 'Represent your city', intro: 'Tell us about the place, the makers and the stories you could bring into the circle. Short answers are welcome.',
    subject: 'Ambassador application', steps: [
      { title: 'Your place', hint: 'Start with the city and people you know.', fields: [
        { id:'city', label:'1. Which city and country would you represent?', type:'text', required:true, placeholder:'e.g. Dubai, UAE' },
        { id:'travel_areas', label:'Which nearby areas could you travel through?', type:'text', required:true, placeholder:'e.g. within my city' },
        { id:'crafts', label:'2. Which crafts and makers do you already know? Who could you introduce in your first month?', type:'textarea', required:true, placeholder:'A few names or craft communities are enough.' },
        { id:'network', label:'3. Which communities, galleries, venues or institutions are you connected to?', type:'textarea', required:true, placeholder:'You can say none yet.' },
      ]},
      { title: 'Your stories', hint: 'Links and honest self-assessment help us understand your style.', fields: [
        { id:'content_examples', label:'4. Have you made vlogs or videos? Share two or three links if you have them.', type:'textarea', required:true, placeholder:'If you are new to filming, just say so.' },
        { id:'camera_confidence', label:'5. How confident are you with filming and directing people?', type:'select', required:true, options:['Just starting','Comfortable with a phone','Confident with camera, sound and lighting'] },
        { id:'training', label:'What would you like training in?', type:'text', required:true, placeholder:'e.g. interviews, lighting, editing, or none yet' },
        { id:'equipment', label:'6. What equipment do you have now?', type:'text', required:true, placeholder:'A phone is enough to mention.' },
        { id:'action_camera', label:'Would you need a Communiverse action camera?', type:'select', required:true, options:['Yes','No','Not sure yet'] },
        { id:'teaching', label:'7. Have you helped others make content? How would you help a maker film on their own?', type:'textarea', required:true, placeholder:'If not yet, tell us how you would begin.' },
      ]},
      { title: 'Your rhythm', hint: 'There is no preferred audience size or fixed schedule.', fields: [
        { id:'followup', label:'8. How would you stay in touch with the makers you introduce?', type:'select', required:true, options:['Weekly check-in','Every two weeks','Monthly check-in','A different approach'] },
        { id:'platforms', label:'9. Which social platforms do you use, and roughly how engaged is your audience?', type:'text', required:true, placeholder:'No audience is needed; tell us where you share.' },
        { id:'languages', label:'10. Which languages can you work in?', type:'text', required:true, placeholder:'e.g. Arabic, English' },
        { id:'monthly_time', label:'11. How much time could you give each month?', type:'select', required:true, options:['Up to 8 hours','8–20 hours','20–40 hours','More than 40 hours','It varies'] },
        { id:'travel_frequency', label:'How often could you travel?', type:'select', required:true, options:['Locally each week','A few trips each month','A few trips each year','Not sure yet'] },
        { id:'story_cadence', label:'12. How often could you deliver vlogs or maker stories?', type:'select', required:true, options:['Weekly','Twice a month','Monthly','It depends on the story'] },
      ]},
      { title: 'What you need', hint: 'Last step. We will follow up personally.', fields: [
        { id:'support', label:'13. What support would help you most from Keiffer, Hassan or the operations team?', type:'textarea', required:true, placeholder:'Training, introductions, equipment, planning…' },
        { id:'questions', label:'14. What is unclear, or what would you add to this brief?', type:'textarea', required:true, placeholder:'You can say nothing to add yet.' },
      ]},
    ],
  },
  artist: {
    title: 'Share your craft', intro: 'Tell us what you make and how you would like people to experience it. Artisans do not pay to apply.',
    subject: 'Artist application', steps: [
      { title:'Your practice', fields:[
        {id:'city',label:'Where do you make your work?',type:'text',required:true,placeholder:'City and country'},
        {id:'craft',label:'What is your main craft or art practice?',type:'text',required:true,placeholder:'e.g. ceramics, weaving, sculpture'},
        {id:'story',label:'How did you learn it, and what matters most in your process?',type:'textarea',required:true,placeholder:'A few sentences are enough.'},
        {id:'materials',label:'Which materials and techniques do you use?',type:'text'},
      ]},
      { title:'Your work', fields:[
        {id:'portfolio',label:'Where can we see examples of your work?',type:'text',placeholder:'Website or social links'},
        {id:'offer',label:'What would you like to offer first?',type:'select',required:true,options:['A workshop or experience','Pieces or commissions','A maker story or film','I would like to explore together']},
        {id:'teaching',label:'If you teach, what could someone make or learn with you?',type:'textarea'},
        {id:'capacity',label:'What is realistic for your time and studio right now?',type:'textarea'},
      ]},
      { title:'Working together', fields:[
        {id:'languages',label:'Which languages do you work in?',type:'text'},
        {id:'media_consent',label:'May we contact you to discuss photographing or filming your work? We will ask permission before publishing anything.',type:'select',required:true,options:['Yes, please ask me first','I would prefer a conversation before deciding']},
        {id:'support',label:'What support would make joining easier?',type:'textarea',placeholder:'Photography, translation, listing help, scheduling…'},
      ]},
    ],
  },
  client: {
    title: 'Make something together', intro: 'Tell us what you are planning. A person will discuss options before any booking or payment.',
    subject: 'Client enquiry', steps: [
      { title:'Your idea', fields:[
        {id:'organisation',label:'Company or group name',type:'text'},
        {id:'city',label:'Where should this happen?',type:'text',required:true,placeholder:'City and country'},
        {id:'interest',label:'What are you looking for?',type:'select',required:true,options:['Team workshop','Private maker experience','Commission or gift','Brand collaboration','I am still exploring']},
        {id:'craft',label:'Any craft, artist or material you have in mind?',type:'text'},
      ]},
      { title:'The people and timing', fields:[
        {id:'group_size',label:'How many people will take part?',type:'select',options:['Just me','2–5','6–15','16–50','More than 50','Not sure yet']},
        {id:'timing',label:'When are you hoping to do this?',type:'text',placeholder:'A date, month or flexible window'},
        {id:'format',label:'What should the experience feel like?',type:'textarea',placeholder:'Hands-on, intimate, public, at your office…'},
      ]},
      { title:'What matters', fields:[
        {id:'access',label:'Any accessibility, language or venue needs?',type:'textarea'},
        {id:'budget',label:'Do you have an approximate budget range?',type:'text',placeholder:'Optional — we can discuss this later'},
        {id:'questions',label:'Anything else we should know?',type:'textarea'},
      ]},
    ],
  },
  belong: {
    title: 'Belong here', intro: 'Follow the crafts and places you care about. Tell us a little about yourself to join the Communiverse circle.',
    subject: 'Community membership', steps: [
      { title:'Your circle', fields:[
        {id:'city',label:'Which city and country are you in?',type:'text',required:true,placeholder:'e.g. Dubai, UAE'},
        {id:'interest',label:'What brings you to craft?',type:'select',required:true,options:['I want to learn','I want to find artists','I want to collect work','I want to meet people nearby','A bit of everything']},
        {id:'crafts',label:'Which crafts catch your eye?',type:'text',placeholder:'Ceramics, textile, wood, metal, lettering…'},
        {id:'updates',label:'May we contact you about relevant makers and gatherings?',type:'select',required:true,options:['Yes, relevant updates are welcome','Only reply about this request']},
      ]},
    ],
  },
};
