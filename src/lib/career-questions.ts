// Big Five: 25 items (5 per trait), IPIP-style short scale.
// Traits: O, C, E, A, N (N here = Emotional Stability, higher = more stable).
// reverse: true means the item is reverse-scored.

export type BigFiveTrait = "O" | "C" | "E" | "A" | "N";
export type RiasecType = "R" | "I" | "A" | "S" | "E" | "C";

export type BigFiveQuestion = {
  id: string;
  trait: BigFiveTrait;
  reverse: boolean;
  en: string;
  ta: string;
};

export const BIG_FIVE_QUESTIONS: BigFiveQuestion[] = [
  { id: "o1", trait: "O", reverse: false, en: "I have a vivid imagination and enjoy exploring new ideas.", ta: "எனக்கு தெளிவான கற்பனை உள்ளது; புதிய கருத்துக்களை ஆராய விரும்புகிறேன்." },
  { id: "o2", trait: "O", reverse: false, en: "I am curious about many different things.", ta: "பல வேறு விஷயங்களைப் பற்றி நான் ஆர்வமாக உள்ளேன்." },
  { id: "o3", trait: "O", reverse: false, en: "I enjoy thinking about abstract concepts.", ta: "சுருக்கமான கருத்துகளைப் பற்றி சிந்திக்க விரும்புகிறேன்." },
  { id: "o4", trait: "O", reverse: true, en: "I avoid activities that require creativity.", ta: "படைப்பாற்றல் தேவைப்படும் செயல்களை நான் தவிர்க்கிறேன்." },
  { id: "o5", trait: "O", reverse: false, en: "I like to try new experiences whenever I can.", ta: "வாய்ப்பு கிடைக்கும் போதெல்லாம் புதிய அனுபவங்களை முயற்சிக்க விரும்புகிறேன்." },

  { id: "c1", trait: "C", reverse: false, en: "I am always prepared and organized.", ta: "நான் எப்போதும் தயாராகவும் ஒழுங்காகவும் இருக்கிறேன்." },
  { id: "c2", trait: "C", reverse: false, en: "I pay attention to details.", ta: "விவரங்களை நான் கவனிக்கிறேன்." },
  { id: "c3", trait: "C", reverse: true, en: "I often leave tasks unfinished.", ta: "பணிகளை நான் அடிக்கடி முடிக்காமல் விட்டுவிடுகிறேன்." },
  { id: "c4", trait: "C", reverse: false, en: "I follow through on my commitments.", ta: "என் உறுதிமொழிகளை நான் நிறைவேற்றுகிறேன்." },
  { id: "c5", trait: "C", reverse: true, en: "I procrastinate on important tasks.", ta: "முக்கியமான பணிகளை நான் தள்ளிப்போடுகிறேன்." },

  { id: "e1", trait: "E", reverse: false, en: "I enjoy being the center of attention.", ta: "கவனத்தின் மையமாக இருப்பதை நான் விரும்புகிறேன்." },
  { id: "e2", trait: "E", reverse: false, en: "I start conversations easily.", ta: "நான் எளிதாக உரையாடல்களைத் தொடங்குகிறேன்." },
  { id: "e3", trait: "E", reverse: true, en: "I prefer quiet time alone over social events.", ta: "சமூக நிகழ்வுகளை விட தனிமையான அமைதியை விரும்புகிறேன்." },
  { id: "e4", trait: "E", reverse: false, en: "I feel energized when I am around people.", ta: "மக்களுடன் இருக்கும் போது எனக்கு ஆற்றல் ஏற்படுகிறது." },
  { id: "e5", trait: "E", reverse: true, en: "I stay in the background at gatherings.", ta: "கூட்டங்களில் நான் பின்னால் இருக்க விரும்புகிறேன்." },

  { id: "a1", trait: "A", reverse: false, en: "I sympathize with others' feelings.", ta: "மற்றவர்களின் உணர்வுகளுக்கு நான் இரக்கம் காட்டுகிறேன்." },
  { id: "a2", trait: "A", reverse: false, en: "I take time to help other people.", ta: "மற்றவர்களுக்கு உதவ நான் நேரம் ஒதுக்குகிறேன்." },
  { id: "a3", trait: "A", reverse: true, en: "I can be critical of others.", ta: "நான் மற்றவர்களை விமர்சிக்கக்கூடும்." },
  { id: "a4", trait: "A", reverse: false, en: "I trust what people say.", ta: "மக்கள் சொல்வதை நான் நம்புகிறேன்." },
  { id: "a5", trait: "A", reverse: true, en: "I insist on getting my own way.", ta: "என் வழியில் மட்டும் செய்ய நான் வலியுறுத்துகிறேன்." },

  { id: "n1", trait: "N", reverse: true, en: "I get stressed out easily.", ta: "நான் எளிதில் மன அழுத்தத்திற்கு உள்ளாகிறேன்." },
  { id: "n2", trait: "N", reverse: true, en: "I worry about many things.", ta: "பல விஷயங்களைப் பற்றி நான் கவலைப்படுகிறேன்." },
  { id: "n3", trait: "N", reverse: false, en: "I stay calm under pressure.", ta: "அழுத்தத்தின் கீழ் நான் அமைதியாக இருக்கிறேன்." },
  { id: "n4", trait: "N", reverse: true, en: "My mood changes often.", ta: "என் மனநிலை அடிக்கடி மாறுகிறது." },
  { id: "n5", trait: "N", reverse: false, en: "I recover quickly from setbacks.", ta: "பின்னடைவுகளிலிருந்து நான் விரைவாக மீளுகிறேன்." },
];

export type RiasecQuestion = {
  id: string;
  type: RiasecType;
  en: string;
  ta: string;
};

// 30 questions, 5 per type
export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  { id: "r1", type: "R", en: "Build or repair mechanical things with your hands.", ta: "கைகளால் இயந்திரப் பொருட்களைக் கட்டுதல் அல்லது பழுதுபார்த்தல்." },
  { id: "r2", type: "R", en: "Work outdoors with tools, plants, or animals.", ta: "கருவிகள், தாவரங்கள் அல்லது விலங்குகளுடன் வெளிப்புறத்தில் வேலை செய்தல்." },
  { id: "r3", type: "R", en: "Operate machinery or vehicles.", ta: "இயந்திரங்கள் அல்லது வாகனங்களை இயக்குதல்." },
  { id: "r4", type: "R", en: "Assemble electronics or construct physical products.", ta: "மின்னணு சாதனங்களைக் கூட்டுதல் அல்லது இயற்பியல் தயாரிப்புகளை உருவாக்குதல்." },
  { id: "r5", type: "R", en: "Do hands-on technical work.", ta: "கை மூலம் தொழில்நுட்ப வேலை செய்தல்." },

  { id: "i1", type: "I", en: "Solve complex mathematical or scientific problems.", ta: "சிக்கலான கணித அல்லது அறிவியல் பிரச்சினைகளைத் தீர்த்தல்." },
  { id: "i2", type: "I", en: "Investigate how things work through research.", ta: "ஆராய்ச்சி மூலம் விஷயங்கள் எப்படி செயல்படுகின்றன என்பதை ஆய்வு செய்தல்." },
  { id: "i3", type: "I", en: "Analyze data to discover patterns.", ta: "வடிவங்களைக் கண்டறிய தரவை பகுப்பாய்வு செய்தல்." },
  { id: "i4", type: "I", en: "Read technical or scientific articles.", ta: "தொழில்நுட்ப அல்லது அறிவியல் கட்டுரைகளைப் படித்தல்." },
  { id: "i5", type: "I", en: "Perform experiments and test hypotheses.", ta: "பரிசோதனைகள் செய்து கருதுகோள்களை சோதித்தல்." },

  { id: "a1", type: "A", en: "Create original art, music, writing, or design.", ta: "அசல் கலை, இசை, எழுத்து அல்லது வடிவமைப்பை உருவாக்குதல்." },
  { id: "a2", type: "A", en: "Express yourself through creative work.", ta: "படைப்பு வேலை மூலம் உங்களை வெளிப்படுத்துதல்." },
  { id: "a3", type: "A", en: "Perform on stage or through media.", ta: "மேடையில் அல்லது ஊடகங்கள் மூலம் நிகழ்த்துதல்." },
  { id: "a4", type: "A", en: "Design visuals, interfaces, or spaces.", ta: "காட்சிகள், இடைமுகங்கள் அல்லது இடங்களை வடிவமைத்தல்." },
  { id: "a5", type: "A", en: "Work in unstructured, imaginative environments.", ta: "கட்டமைப்பற்ற, கற்பனை மிக்க சூழல்களில் வேலை செய்தல்." },

  { id: "s1", type: "S", en: "Teach or mentor others.", ta: "மற்றவர்களுக்கு கற்பித்தல் அல்லது வழிகாட்டுதல்." },
  { id: "s2", type: "S", en: "Help people with personal problems.", ta: "தனிப்பட்ட பிரச்சினைகளில் மக்களுக்கு உதவுதல்." },
  { id: "s3", type: "S", en: "Work with groups to reach shared goals.", ta: "பொது இலக்குகளை அடைய குழுக்களுடன் வேலை செய்தல்." },
  { id: "s4", type: "S", en: "Provide healthcare or counseling.", ta: "சுகாதாரம் அல்லது ஆலோசனை வழங்குதல்." },
  { id: "s5", type: "S", en: "Volunteer for community causes.", ta: "சமூக காரணங்களுக்காக தன்னார்வத் தொண்டு செய்தல்." },

  { id: "e1", type: "E", en: "Lead a team or project.", ta: "ஒரு குழு அல்லது திட்டத்தை வழிநடத்துதல்." },
  { id: "e2", type: "E", en: "Persuade others to buy or believe something.", ta: "எதையாவது வாங்க அல்லது நம்ப மற்றவர்களை வற்புறுத்துதல்." },
  { id: "e3", type: "E", en: "Start your own business.", ta: "உங்கள் சொந்த வணிகத்தைத் தொடங்குதல்." },
  { id: "e4", type: "E", en: "Negotiate deals or agreements.", ta: "ஒப்பந்தங்கள் அல்லது ஒப்பந்தங்களை பேச்சுவார்த்தை செய்தல்." },
  { id: "e5", type: "E", en: "Take risks to achieve ambitious goals.", ta: "லட்சிய இலக்குகளை அடைய அபாயங்களை எடுத்தல்." },

  { id: "c1", type: "C", en: "Organize records, files, or data.", ta: "பதிவுகள், கோப்புகள் அல்லது தரவை ஒழுங்கமைத்தல்." },
  { id: "c2", type: "C", en: "Follow clear procedures and rules.", ta: "தெளிவான நடைமுறைகள் மற்றும் விதிகளைப் பின்பற்றுதல்." },
  { id: "c3", type: "C", en: "Work with numbers, budgets, or accounting.", ta: "எண்கள், பட்ஜெட்டுகள் அல்லது கணக்கியலுடன் வேலை செய்தல்." },
  { id: "c4", type: "C", en: "Manage schedules and detailed logistics.", ta: "அட்டவணைகள் மற்றும் விரிவான தளவாடங்களை நிர்வகித்தல்." },
  { id: "c5", type: "C", en: "Ensure accuracy in reports and documents.", ta: "அறிக்கைகள் மற்றும் ஆவணங்களில் துல்லியத்தை உறுதி செய்தல்." },
];
