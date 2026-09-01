// بيانات المتجر: التصنيفات والأدوية
const CATEGORIES = [
  { id: "pain",    name: "مسكنات الألم",   icon: "💊" },
  { id: "cold",    name: "البرد والسعال",  icon: "🤧" },
  { id: "vitamin", name: "فيتامينات",      icon: "🍊" },
  { id: "digest",  name: "الجهاز الهضمي",  icon: "🫄" },
  { id: "skin",    name: "العناية بالبشرة", icon: "🧴" },
  { id: "baby",    name: "عناية الطفل",    icon: "🍼" },
];

const PRODUCTS = [
  { id: 1,  name: "بنادول اكسترا 500 مجم",       category: "pain",    price: 18.50, emoji: "💊", desc: "شريط 24 قرص لتسكين الألم وخفض الحرارة" },
  { id: 2,  name: "بروفين 400 مجم",              category: "pain",    price: 22.00, emoji: "💊", desc: "مضاد التهاب ومسكن، 30 قرص" },
  { id: 3,  name: "فولتارين جل",                 category: "pain",    price: 35.00, emoji: "🧴", desc: "جل موضعي لآلام العضلات والمفاصل 50جم" },
  { id: 4,  name: "كونجستال",                    category: "cold",    price: 16.75, emoji: "🤧", desc: "لعلاج أعراض البرد والزكام، 20 قرص" },
  { id: 5,  name: "شراب توسيفان",                category: "cold",    price: 28.00, emoji: "🍯", desc: "شراب للسعال الجاف والمخاطي 120مل" },
  { id: 6,  name: "فيتامين سي 1000",             category: "vitamin", price: 45.00, emoji: "🍊", desc: "أقراص فوارة لدعم المناعة، 20 قرص" },
  { id: 7,  name: "فيتامين د3 50000 وحدة",       category: "vitamin", price: 38.25, emoji: "☀️", desc: "كبسولات أسبوعية لنقص فيتامين د" },
  { id: 8,  name: "أوميغا 3",                    category: "vitamin", price: 65.00, emoji: "🐟", desc: "زيت السمك لصحة القلب والذاكرة، 60 كبسولة" },
  { id: 9,  name: "نتروجين أوميز",               category: "digest",  price: 32.50, emoji: "🫄", desc: "لعلاج الحموضة وقرحة المعدة، 14 كبسولة" },
  { id: 10, name: "بوسمول شراب",                  category: "digest",  price: 24.00, emoji: "🥛", desc: "مضاد للإسهال، شراب 125 مل" },
  { id: 11, name: "سيتال كريم مرطب",              category: "skin",    price: 42.00, emoji: "🧴", desc: "كريم مرطب للبشرة الجافة والحساسة 200مل" },
  { id: 12, name: "واقي شمس SPF 50",              category: "skin",    price: 89.00, emoji: "🌞", desc: "حماية عالية من الأشعة فوق البنفسجية 50مل" },
  { id: 13, name: "حفاضات أطفال مقاس 3",          category: "baby",    price: 95.00, emoji: "🍼", desc: "علبة 60 حفاض مريحة وناعمة" },
  { id: 14, name: "شراب فيتامين للأطفال",         category: "baby",    price: 36.00, emoji: "🧒", desc: "مكمل فيتامينات لذيذ الطعم للأطفال 150مل" },
  { id: 15, name: "محلول ملحي للأنف",             category: "cold",    price: 15.00, emoji: "💧", desc: "غسول أنف لطيف للأطفال والكبار" },
  { id: 16, name: "بانثينول كريم",                category: "skin",    price: 27.75, emoji: "🌿", desc: "لترطيب وعلاج الجروح السطحية البسيطة" },
];

const CATEGORY_NAME = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]));
