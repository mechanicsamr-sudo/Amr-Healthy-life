// محتوى التنبيهات الصحية. هذه إرشادات تذكيرية عامة، وليست تشخيصًا ولا قرارًا علاجيًا.
import type { Bi, Difficulty, Energy } from "./types";

export const DISCLAIMER: Bi = {
  ar: "هذا التطبيق أداة شخصية لتنظيم التمرين وتسجيله. لا يشخّص أي حالة ولا يحدد سلامة أي تمرين طبيًا. استشر طبيبك أو أخصائي العلاج الطبيعي بخصوص حالتك. لا تغيّر أي دواء بدون طبيبك.",
  en: "This app is a personal tool to organise and log your training. It doesn't diagnose any condition or decide whether an exercise is medically safe. Ask your doctor or physiotherapist about your condition. Never change any medication without your doctor.",
};

export const RED_FLAGS: Bi[] = [
  { ar: "ألم أو ضغط أو ثقل في الصدر، أو ألم يمتد للذراع أو الفك أو الظهر.", en: "Chest pain, pressure or heaviness, or pain spreading to the arm, jaw or back." },
  { ar: "إغماء أو شعور بقرب الإغماء، أو دوخة شديدة لا تزول مع الراحة.", en: "Fainting or feeling faint, or severe dizziness that doesn't settle with rest." },
  { ar: "ضيق تنفس غير معتاد لا يتناسب مع المجهود.", en: "Unusual shortness of breath out of proportion to the effort." },
  { ar: "خفقان شديد أو نبض غير منتظم بشكل مفاجئ.", en: "Sudden strong palpitations or an irregular pulse." },
  { ar: "صداع مفاجئ شديد، أو اضطراب في الرؤية أو الكلام.", en: "A sudden severe headache, or problems with vision or speech." },
  { ar: "ضعف أو تنميل جديد في الرجلين أو الذراعين.", en: "New weakness or numbness in the legs or arms." },
  { ar: "اضطراب جديد في التحكم في البول أو البراز، أو تنميل في منطقة الجلوس، مصاحب لألم الظهر.", en: "New problems controlling bladder or bowel, or numbness in the saddle area, with back pain." },
  { ar: "تورم مفاجئ أو احمرار وسخونة شديدة في الركبة، أو عدم القدرة على تحميل الوزن عليها.", en: "Sudden swelling, redness or heat in the knee, or being unable to bear weight on it." },
];

export const RED_FLAG_ACTION: Bi = {
  ar: "أوقف التمرين فورًا واطلب المساعدة الطبية العاجلة. في مصر اتصل بالإسعاف على 123، أو بالرقم المحلي للطوارئ في بلدك.",
  en: "Stop exercising immediately and get urgent medical help. In Egypt call the ambulance on 123, or your local emergency number.",
};

export const CONDITION_GUIDANCE: Record<"kneeOA" | "backPain" | "bp" | "beginner", { title: Bi; points: Bi[] }> = {
  kneeOA: {
    title: { ar: "خشونة الركبة (الدرجة الأولى)", en: "Knee osteoarthritis (grade 1)" },
    points: [
      { ar: "ألم خفيف (حتى 3 من 10) قد يكون مقبولًا إذا عاد لمستواه المعتاد خلال 24 ساعة؛ هذا مرجع شائع لكن القرار لطبيبك أو أخصائيك.", en: "Mild pain (up to 3/10) may be acceptable if it settles to your usual level within 24 hours; this is a common guide, but the decision belongs to your doctor or specialist." },
      { ar: "إذا زاد الألم أثناء حركة معينة، أوقفها وجرّب مدى حركة أقصر أو بديلًا بحمل أقل على الركبة.", en: "If pain increases during a movement, stop it and try a shorter range or a lower-knee-load alternative." },
      { ar: "التمارين المعلَّمة \"تحتاج مراجعة\" لا تُستخدم إلا بعد تقييم متخصص.", en: "Exercises marked \"needs review\" are only used after a specialist's assessment." },
    ],
  },
  backPain: {
    title: { ar: "ألم الظهر المتقطع", en: "Intermittent back pain" },
    points: [
      { ar: "حافظ على وضع محايد للظهر واستخدم الأجهزة ذات المسند عند الشك.", en: "Keep a neutral spine and use supported machines when in doubt." },
      { ar: "لا تكمل حركة تثير ألمًا ينتشر للرجل أو يزداد مع التكرار.", en: "Don't continue a movement that causes pain spreading into the leg or worsening with each rep." },
      { ar: "في أيام نوبات الألم يمكن تخفيف الحصة أو تأجيلها وتسجيل ذلك.", en: "On flare-up days you can lighten or postpone the session and log it." },
    ],
  },
  bp: {
    title: { ar: "تناول دواء الضغط", en: "Blood-pressure medication" },
    points: [
      { ar: "استمر على الدواء كما وصفه الطبيب، واسأله عن الحدود المناسبة لشدة التمرين. التطبيق لا يقترح أي تغيير في الدواء.", en: "Keep taking your medication as prescribed and ask your doctor about suitable exercise intensity. The app never suggests medication changes." },
      { ar: "لا تحبس النفس أثناء الرفع؛ ازفر أثناء المجهود.", en: "Don't hold your breath while lifting; exhale during the effort." },
      { ar: "بعض أدوية الضغط قد تؤثر على معدل ضربات القلب، لذلك يعتمد التطبيق على مقياس الجهد (RPE) واختبار الكلام بدلًا من نبض مستهدف.", en: "Some BP medications affect heart rate, so the app uses effort (RPE) and the talk test instead of a target heart rate." },
      { ar: "انهض ببطء بعد الاستلقاء أو الجلوس، واختم الحصة بتهدئة تدريجية.", en: "Get up slowly after lying or sitting, and finish each session with a gradual cool-down." },
      { ar: "إذا كنت تقيس الضغط في المنزل يمكنك تسجيل القراءات في القياسات لمشاركتها مع طبيبك؛ التطبيق لا يفسرها.", en: "If you measure your blood pressure at home you can log readings to share with your doctor; the app doesn't interpret them." },
    ],
  },
  beginner: {
    title: { ar: "مستوى مبتدئ", en: "Beginner level" },
    points: [
      { ar: "الأولوية لتعلم الحركة الصحيحة وضبط الأجهزة، وليس لرفع أوزان كبيرة.", en: "The priority is learning correct movement and machine setup, not lifting heavy." },
      { ar: "اترك 3-4 تكرارات في المخزون في البداية (جهد 5-6 من 10).", en: "Leave 3–4 reps in reserve at first (effort 5–6 out of 10)." },
      { ar: "اطلب من مدرب الصالة مراجعة أدائك في الأسابيع الأولى.", en: "Ask a gym coach to check your form in the first weeks." },
    ],
  },
};

export const RPE_SCALE: { value: number; label: Bi }[] = [
  { value: 5, label: { ar: "5 - سهل: يمكنك أداء 5 تكرارات أو أكثر", en: "5 – Easy: 5+ reps left" } },
  { value: 6, label: { ar: "6 - متوسط: يتبقى 4 تكرارات تقريبًا", en: "6 – Moderate: about 4 reps left" } },
  { value: 7, label: { ar: "7 - صعب نسبيًا: يتبقى 3 تكرارات", en: "7 – Fairly hard: 3 reps left" } },
  { value: 8, label: { ar: "8 - صعب: يتبقى 2 تكرار", en: "8 – Hard: 2 reps left" } },
  { value: 9, label: { ar: "9 - صعب جدًا: يتبقى تكرار واحد", en: "9 – Very hard: 1 rep left" } },
  { value: 10, label: { ar: "10 - أقصى جهد", en: "10 – Maximum effort" } },
];

// ---------- اختيارات سريعة بدل الكتابة ----------

export const DIFFICULTY: { id: Difficulty; label: Bi; emoji: string; rpe: number }[] = [
  { id: "easy", label: { ar: "سهل", en: "Easy" }, emoji: "😌", rpe: 5 },
  { id: "right", label: { ar: "مناسب", en: "Just right" }, emoji: "👍", rpe: 7 },
  { id: "hard", label: { ar: "صعب", en: "Difficult" }, emoji: "😤", rpe: 9 },
];

export type PainLevel = "none" | "mild" | "moderate" | "severe";
export const PAIN_LEVELS: { id: PainLevel; label: Bi; emoji: string; value: number }[] = [
  { id: "none", label: { ar: "بدون ألم", en: "No pain" }, emoji: "🙂", value: 0 },
  { id: "mild", label: { ar: "ألم بسيط", en: "Mild pain" }, emoji: "😐", value: 2 },
  { id: "moderate", label: { ar: "ألم متوسط", en: "Moderate pain" }, emoji: "😣", value: 5 },
  { id: "severe", label: { ar: "ألم شديد", en: "Severe pain" }, emoji: "😖", value: 8 },
];

/** تحويل الرقم المحفوظ (0-10) إلى مستوى ألم للعرض */
export function painLevelOf(v: number | null | undefined): PainLevel | null {
  if (v == null) return null;
  if (v <= 0) return "none";
  if (v <= 3) return "mild";
  if (v <= 6) return "moderate";
  return "severe";
}

export const ENERGY: { id: Energy; label: Bi }[] = [
  { id: "excellent", label: { ar: "ممتاز", en: "Excellent" } },
  { id: "good", label: { ar: "جيد", en: "Good" } },
  { id: "average", label: { ar: "متوسط", en: "Average" } },
  { id: "low", label: { ar: "منخفض", en: "Low" } },
];

/** رسائل تحفيز متنوعة بعد كل «تم» */
export const MOTIVATION: Bi[] = [
  { ar: "برافو عليك! خطوة جديدة نحو هدفك 💪", en: "Great job! Another step toward your goal 💪" },
  { ar: "ممتاز! استمر بنفس القوة.", en: "Excellent! Keep up that strength." },
  { ar: "إنجاز جديد اتسجل النهارده!", en: "Another milestone completed!" },
  { ar: "عاش! أنت بتقرب من هدفك.", en: "Nice! You're getting closer to your goal." },
  { ar: "شغل نضيف! كده التكنيك مظبوط.", en: "Clean work! That's good technique." },
  { ar: "كمّل كده، كل مجموعة بتفرق.", en: "Keep pushing — every set counts." },
  { ar: "أحسنت! الالتزام هو سر النتيجة.", en: "Well done! Consistency is the secret." },
  { ar: "قوي! خد نفسك وجهز للي بعده.", en: "Strong! Breathe and get ready for the next one." },
];

/** تذكير حسب مستوى الألم المسجل. لا يغيّر البرنامج ولا يقرر أي علاج. */
export function painReminder(pain: number | null, baseline: number | null): Bi | null {
  if (pain == null) return null;
  if (pain >= 7)
    return {
      ar: "ألم شديد: أوقف هذه الحركة الآن. لن نقترح بديلًا يحمّل نفس المنطقة في هذه الحصة. إذا استمر الألم أو صاحبه تورم أو عدم قدرة على التحميل، اطلب تقييمًا متخصصًا.",
      en: "Severe pain: stop this movement now. We won't suggest an alternative that loads the same area this session. If pain persists or comes with swelling or inability to bear weight, get a specialist assessment.",
    };
  if (baseline != null && pain - baseline >= 2)
    return { ar: "الألم زاد مقارنة ببداية الحصة: أوقف الحركة التي تزيد الألم، أو جرّب مدى أقصر/بديلًا بعد التحقق.", en: "Pain has increased since the start of the session: stop the movement that's making it worse, or try a shorter range/an alternative after checking." };
  if (pain >= 4) return { ar: "ألم متوسط: لا تكمل الحركة إذا كانت تزيده. فكّر في تقليل المدى أو الوزن أو اختيار بديل.", en: "Moderate pain: don't continue if the movement makes it worse. Consider a shorter range, less weight or an alternative." };
  return null;
}
