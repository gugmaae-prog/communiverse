import {ARTISTS} from './plug-gallery-data.js';
export {ARTISTS};
export const RELEASE='20261008-marketplace-1';
export const PREFIX='/communiverse/_public/'+RELEASE;
export const CATEGORIES=['Ceramics','Textiles','Wood','Glass','Metal & jewellery','Paper & prints','Baskets','Sculpture'];
const item=(id,title,artistIndex,category,price,material,size,description,image)=>({id,title,artist:ARTISTS[artistIndex].slug,category,price,material,size,description,image:PREFIX+'/'+image+'.jpg'});
export const ITEMS=[
item('seam-vase','The second-life vase',0,'Ceramics',98,'Stoneware · glazed seam','22 × 14 cm','An everyday vessel with a quiet blue seam. Warm ivory glaze leaves the clay’s texture visible.','ceramic'),
item('indigo-throw','Slow indigo throw',1,'Textiles',125,'Handwoven cotton','130 × 170 cm','A loose weave, deep indigo and a fringe left slightly uneven. Made for a chair, a bed or a long afternoon.','textile'),
item('walnut-fold','A fold in walnut',2,'Wood',240,'Solid walnut · oil finish','24 × 18 cm','A sculptural fold follows the grain instead of hiding it. Warm to the touch from every angle.','wood'),
item('tidal-glass','Tidal glass vessel',9,'Glass',110,'Blown glass','19 × 12 cm','Sea-green glass catches light in its thick base and gently asymmetric rim.','glass'),
item('brass-circle','Circle of light',5,'Metal & jewellery',85,'Brushed brass','16 × 12 cm','A balanced brass form for a shelf or table. A small sculpture with a practical purpose.','metal'),
item('block-cushion','Botanical block cushion',6,'Textiles',58,'Printed linen · cotton insert','45 × 45 cm','Rust and indigo motifs build a repeating rhythm across a soft linen surface.','print'),
item('coiled-basket','The gathering basket',8,'Baskets',72,'Coiled palm fibre','30 × 8 cm','One line becomes a vessel. An open shallow basket for fruit, letters and small daily treasures.','basket'),
item('paper-stroke','A single quiet stroke',4,'Paper & prints',65,'Ink · handmade paper','30 × 40 cm','The edge of a brushstroke meets the soft grain of handmade paper. Frame included in the study.','paper'),
item('wire-form','Line in the air',3,'Sculpture',180,'Shaped steel wire','28 × 18 cm','A form drawn through open space. Light and shadow become part of the work.','wire'),
item('silver-bowl','Hammered silver bowl',7,'Metal & jewellery',145,'Silver-tone hammered metal','12 × 6 cm','A small bowl with a luminous surface and the rhythm of a hammer left visible.','silver'),
item('morning-cups','Two morning cups',0,'Ceramics',48,'Glazed stoneware','Pair · 220 ml each','A pair of soft ivory cups, shaped for slow mornings and comfortable hands.','cups'),
item('woven-runner','Indigo table runner',1,'Textiles',68,'Handwoven cotton','35 × 150 cm','A woven rhythm for everyday meals, with a narrow fringe at each end.','runner'),
item('wood-spoons','Walnut serving spoons',2,'Wood',42,'Oiled walnut','Pair · 26 cm','Useful wood, warm curves and a finish that keeps the grain close.','spoons'),
item('glass-pair','Two sea-green tumblers',9,'Glass',56,'Blown glass','Pair · 250 ml each','Small differences in shape let each glass catch light in its own way.','tumblers'),
item('paper-set','Paper studies, a trio',4,'Paper & prints',38,'Ink · cotton rag paper','Three · A5','Three small compositions to keep together or share.','paper-set'),
item('woven-tray','Palm-fibre tray',8,'Baskets',44,'Woven palm fibre','26 × 4 cm','A shallow everyday tray with a natural weave and gently raised edge.','tray')
];
export const SESSION_PRICES=[55,45,75,60,38,65,40,75,42,95];
const city=(id,name,country,lat,lon,venues)=>({id,name,country,lat,lon,venues});
const venue=(name,type,craft,url,note)=>({name,type,craft,url,note});
export const CITIES=[
city('dubai','Dubai','UAE',25.20,55.27,[venue('Jameel Arts Centre','Gallery','Contemporary art','https://jameelartscentre.org/','Exhibitions, learning and an artist-led programme.')]),
city('sharjah','Sharjah','UAE',25.35,55.40,[venue('Sharjah Art Foundation','Gallery','Art & workshops','https://www.sharjahart.org/','Explore exhibitions and the current learning programme.')]),
city('islamabad','Islamabad','Pakistan',33.69,73.05,[venue('Lok Virsa Heritage Museum','Museum','Living crafts','https://lokvirsa.org.pk/heritage-museum/','Folk heritage, craft traditions and the artisan bazaar.')]),
city('manila','Manila','Philippines',14.60,120.98,[venue('National Museum of Anthropology','Museum','Textiles & ceramics','https://www.nationalmuseum.gov.ph/our-museums/national-museum-of-anthropology/','Explore Philippine weaving, pottery and living traditions.')]),
city('kuala-lumpur','Kuala Lumpur','Malaysia',3.14,101.69,[venue('Islamic Arts Museum Malaysia','Museum','Textiles, wood & metal','https://iamm.org.my/','Craft galleries, educational activities and a museum shop.')]),
city('jingdezhen','Jingdezhen','China',29.27,117.18,[venue('China Ceramics Museum','Museum','Ceramics','https://www.jdz.gov.cn/zjcd/mljdz/lylx/t932954.shtml','Discover the city’s ceramic heritage. Use the official reservation channel.')]),
city('bogota','Bogotá','Colombia',4.71,-74.07,[venue('Artesanías de Colombia','Crafts','Colombian craft','https://artesaniasdecolombia.com.co/PortalAC/tiendaSubMenu/tiendas_1515','Explore the Las Aguas craft store in Bogotá and other official artisan collections.')]),
city('jeddah','Jeddah','Saudi Arabia',21.54,39.17,[venue('Hayy Jameel','Workshops','Ceramics & wood','https://hayyjameel.org/','Hayy Makers, exhibitions and a creative learning programme.')]),
city('lima','Lima','Peru',-12.05,-77.05,[venue('Museo Larco','Museum','Ceramics & metal','https://www.museolarco.org/','Explore ancient Peruvian craft and museum learning experiences.')]),
city('delhi','New Delhi','India',28.61,77.21,[venue('National Crafts Museum & Hastkala Academy','Museum','Indian craft','https://nationalcraftsmuseum.nic.in/','Traditional craft collections and a living craft setting.')]),
city('tashkent','Tashkent','Uzbekistan',41.30,69.24,[venue('Museum of Applied Arts','Museum','Ceramics & textiles','https://uzbekistan.travel/en/o/state-museum-of-applied-art-of-uzbekistan/','Uzbek decorative and applied arts. Check the official visitor information.')])
];
export const CURRENCIES=['USD','EUR','GBP','AED','SAR','PHP','MYR','CNY','INR','PKR','COP','PEN','SGD','UZS'];
