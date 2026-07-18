/* ==========================================================================
   CONSTANTS shared across the app
   ========================================================================== */
var CATEGORY_KEYS = ['morning','health','growth','productivity','mindfulness','nutrition'];
var CAT_COLORS = { morning:'#F59E0B', health:'#22C55E', growth:'#8B5CF6', productivity:'#3B82F6', mindfulness:'#EC4899', nutrition:'#14B8A6' };

var THEME_LIST = [
  {key:'forest',   c1:'#22C55E', c2:'#14B8A6'},
  {key:'ocean',    c1:'#3B82F6', c2:'#60A5FA'},
  {key:'sunset',   c1:'#EC4899', c2:'#F97316'},
  {key:'midnight', c1:'#6366F1', c2:'#A78BFA'}
];

var LANG_LIST = [
  {key:'en', flag:'🇬🇧', name:'English'},
  {key:'ar', flag:'🇸🇦', name:'العربية'},
  {key:'fr', flag:'🇫🇷', name:'Français'},
  {key:'de', flag:'🇩🇪', name:'Deutsch'},
  {key:'zh', flag:'🇨🇳', name:'中文'}
];

var EMOJI_LIBRARY = {
  Activity:["⏰","🏋️","🧘","🏃","🚴","🏊","⚽","🏀","🎯","🧗","🤸","🥊","⛹️","🚶","🧎","🤾"],
  Health:["💧","🚿","😴","🩺","💊","🫁","🦷","🧴","🧠","❤️","🦴","🩹","🧬","🌡️"],
  Food:["🥗","🍎","🍭","🍔","🍷","☕","🍵","🥤","🍫","🥦","🍇","🍌","🥑","🍕","🧃"],
  Objects:["📖","💻","🗓️","✍️","🎓","🚀","📵","🔑","💡","📈","🧾","🗂️","🖊️","📱","⌚","🧰"],
  Nature:["🌱","🌳","🌞","🌙","🌊","🔥","⭐","🌈","❄️","🌸","🍀","🌵"],
  Symbols:["🙏","❤️‍🔥","✅","🎯","🏆","💪","🧩","♾️","🕊️","🔔","🎨","🧘‍♂️"],
  Smileys:["😊","😌","🤓","😤","🥳","🙂","😇","🤩","😎","🧑‍💻","🧑‍🎓","🧑‍🍳"]
};

var DEFAULT_HABITS = [
  {name:'Wake up at 05:00', icon:'⏰', cat:'morning'},
  {name:'Stretching', icon:'🧘', cat:'health'},
  {name:'Reading', icon:'📖', cat:'growth'},
  {name:'Learning', icon:'🎓', cat:'growth'},
  {name:'Morning Planning', icon:'🗓️', cat:'productivity'},
  {name:'Deep Work', icon:'💻', cat:'productivity'},
  {name:'Workout', icon:'🏋️', cat:'health'},
  {name:'Meditation', icon:'🧘‍♂️', cat:'mindfulness'},
  {name:'Drink Water', icon:'💧', cat:'health'},
  {name:'Journaling', icon:'✍️', cat:'mindfulness'},
  {name:'Sleep Before 11 PM', icon:'😴', cat:'health'},
  {name:'Gratitude', icon:'🙏', cat:'mindfulness'}
];
