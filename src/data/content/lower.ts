import { bi, HOLD_BREATH, m, TOO_FAST, TOO_HEAVY, type ContentMap } from "./helpers";

const BREATH_EN = "Exhale during the effort and inhale on the way back. Don't hold your breath.";
const TALK = "You should be able to speak in full sentences (talk test).";

const KNEE_IN = m("posture", "الركبة بتدخل لجوه", "Knees caving inward", "بيزود الضغط على الركبة، وده مهم جدًا مع الخشونة.", "It increases stress on the knee—especially important with osteoarthritis.", "خلي الركبة على خط صوابع رجلك طول الحركة.", "Keep your knees tracking over your toes throughout.");
const KNEE_PAIN = m("safety", "تكملة الحركة مع ألم في الركبة", "Pushing through knee pain", "الألم اللي بيزيد معناه إن الحمل أكبر من اللازم على المفصل.", "Increasing pain means the joint is overloaded.", "قصّر المدى أو قلل الوزن، ولو الألم مستمر استخدم بديل.", "Shorten the range or reduce the load; if pain persists, switch to an alternative.");
const GETUP = m("safety", "القيام من الأرض بسرعة", "Getting up from the floor quickly", "مع دواء الضغط ممكن تحس بدوخة.", "On BP medication this can cause dizziness.", "اقعد الأول، وبعدين قف ببطء وانت ماسك حاجة ثابتة.", "Sit first, then stand slowly holding something stable.");
const RAIL = m("posture", "التمسك بالمقابض بقوة", "Gripping the handrails hard", "بيقلل المجهود الحقيقي وبيغير طريقة المشي.", "It reduces the real effort and changes your gait.", "امسك بخفة للتوازن بس.", "Hold lightly for balance only.");

export const LOWER: ContentMap = {
  // ---------------- الفخذ الأمامية ----------------
  leg_press: {
    en: {
      setup: ["Set the back rest so your lower back and hips stay on it the whole time.", "Feet hip-width in the middle of the platform or a bit higher (reduces knee bend).", "Find a knee-comfortable range before adding weight."],
      steps: ["Release the safety, then lower slowly to a comfortable knee angle (usually about 90° or less).", "Press through the whole foot with knees tracking over the toes.", "Stop just before locking the knees."],
      breathing: "Exhale as you press and inhale as you lower. Don't hold your breath, even with heavier weights.",
      precautions: ["Shorten the range if knee pain increases.", "Keep the hips on the pad to protect your back."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الظهر والحوض على المسند، والقدم بعرض الحوض في نص اللوحة.", "Back and hips on the pad, feet hip-width mid-platform."),
    posture: bi("الحوض ملتصق بالمسند، والركبة على خط صوابع القدم.", "Hips stay on the pad; knees track over the toes."),
    range: bi("نزول لحد حوالي 90 درجة أو أقل حسب راحة الركبة، ومن غير قفل في الآخر.", "Lower to about 90° or less as the knee allows; no lockout at the top."),
    mistakes: [
      m("range", "النزول العميق لحد ما الحوض يتحرك", "Going so deep the hips roll up", "بيلف أسفل الظهر ويزود الضغط على الركبة.", "It rounds the lower back and increases knee stress.", "قصّر المدى ووقّف قبل ما الحوض يبعد عن المسند.", "Shorten the range and stop before the hips leave the pad."),
      KNEE_IN,
      m("range", "قفل الركبة بعنف", "Snapping the knees locked", "الضغط بيروح للمفصل نفسه.", "Load goes straight into the joint.", "وقف والركبة مثنية ثني خفيف.", "Stop with a slight bend in the knees."),
      m("setup", "القدم في أسفل اللوحة", "Feet too low on the platform", "بيزود ثني الركبة والضغط عليها.", "It increases knee bend and pressure.", "حط القدم في النص أو أعلى شوية.", "Place feet in the middle or slightly higher."),
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  sit_to_stand: {
    en: {
      setup: ["Use a bench or box at a height you can sit on without pain.", "The higher the surface, the less load on the knee."],
      steps: ["Sit back with the hips until you lightly touch the surface.", "Stand by pushing through the whole foot.", "You may reach the arms forward for balance."],
      breathing: BREATH_EN, precautions: ["Raise the surface if knee pain increases."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("واقف قدام البنش والقدم بعرض الكتف.", "Standing in front of the bench, feet shoulder-width."),
    posture: bi("صدر مرفوع والوزن على كامل القدم.", "Chest up, weight across the whole foot."),
    range: bi("لحد ما المؤخرة تلمس البنش بخفة.", "Until your glutes lightly touch the bench."),
    mistakes: [
      m("tempo", "السقوط على السطح", "Dropping onto the surface", "بيخبط الركبة والظهر.", "It jolts the knees and back.", "انزل ببطء ولمسة خفيفة بس.", "Lower slowly with only a light touch."),
      KNEE_IN,
      m("posture", "الانحناء الشديد لقدام", "Leaning far forward", "بيحمّل أسفل الظهر.", "It loads the lower back.", "خلي صدرك مرفوع ومد دراعك لقدام للتوازن.", "Keep your chest up and reach the arms forward."),
      m("setup", "سطح واطي جدًا", "Surface too low", "ثني ركبة كبير بيزود الألم.", "Deep knee bend increases pain.", "ارفع السطح بوسادة أو بنش أعلى.", "Raise it with a cushion or a higher bench."),
    ],
  },
  goblet_box_squat: {
    en: {
      setup: ["Hold one dumbbell vertically in front of your chest.", "Place a bench or box behind you as a depth guide."],
      steps: ["Sit back until you lightly touch the surface.", "Stand up keeping the chest lifted."],
      breathing: BREATH_EN, precautions: ["Start without weight, then add a light dumbbell.", "Choose a knee-friendly height."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("الدمبل قدام الصدر والقدم بعرض الكتف قدام البنش.", "Dumbbell at the chest, feet shoulder-width in front of the bench."),
    posture: bi("صدر مرفوع وظهر محايد والكعب على الأرض.", "Chest up, neutral spine, heels down."),
    range: bi("لحد لمسة خفيفة على البنش.", "Down to a light touch on the bench."),
    mistakes: [
      m("posture", "تدوير الظهر", "Rounding the back", "بيضغط على الفقرات مع الوزن.", "It loads the spine under weight.", "شد الدمبل لصدرك وارفع صدرك.", "Hug the dumbbell to your chest and lift your chest."),
      m("posture", "رفع الكعب", "Heels lifting", "بيرمي الضغط على الركبة.", "It shifts load onto the knees.", "ادفع بالكعب ونص القدم.", "Drive through heels and mid-foot."),
      KNEE_IN,
      HOLD_BREATH("الطلوع", "standing up"),
    ],
  },
  step_up_low: {
    en: {
      setup: ["Start with a low step (about 10–20 cm).", "Stand next to a rail or machine for balance."],
      steps: ["Place the whole foot on the step.", "Step up by pushing through the front foot.", "Step down slowly with the same leg."],
      breathing: BREATH_EN, precautions: ["If knee pain increases, use the leg press with a short range instead."], guideline: "2–3 sets × 8–10 reps per leg",
    },
    start: bi("قدم كاملة على الدرجة والإيد ماسكة حاجة ثابتة.", "Whole foot on the step, hand on something stable."),
    posture: bi("جذع معتدل والركبة على خط الصوابع.", "Upright trunk, knee over the toes."),
    range: bi("صعود كامل على درجة واطية ونزول ببطء.", "Full step-up on a low step and a slow step-down."),
    mistakes: [
      m("posture", "الدفع بالرجل اللي ورا", "Pushing off the back foot", "الرجل الأمامية مش بتشتغل.", "The front leg barely works.", "خلي الرجل اللي ورا خفيفة وارفع بالأمامية.", "Keep the back foot light and lift with the front leg."),
      KNEE_IN,
      m("setup", "درجة عالية", "Step too high", "بيزود ثني الركبة والألم.", "It increases knee bend and pain.", "ابدأ بـ 10-15 سم.", "Start with 10–15 cm."),
      KNEE_PAIN,
    ],
  },
  leg_extension: {
    en: {
      setup: ["Line up the machine's pivot with your knee joint.", "Lower pad sits just above the ankle."], steps: ["Straighten the knee slowly.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Don't use it before a specialist's review."], guideline: "As advised by a specialist",
      reviewRequired: "Needs the range and resistance set with a specialist because of knee osteoarthritis; not added to the program automatically.",
    },
    start: bi("محور الجهاز على مفصل الركبة والوسادة فوق الكاحل.", "Pivot at the knee, pad above the ankle."),
    posture: bi("ظهر على المسند وماسك المقابض.", "Back on the pad, holding the handles."),
    range: bi("المدى يحدده الأخصائي.", "Range to be set by your specialist."),
    mistakes: [
      m("tempo", "الركل السريع", "Kicking fast", "بيحمّل غضروف الركبة بقوة.", "It loads the knee cartilage hard.", "حركة بطيئة جدًا ومدى قصير.", "Very slow, short-range movement."),
      TOO_HEAVY,
      m("setup", "المحور مش على الركبة", "Pivot not aligned with the knee", "بيعمل قوة قص على المفصل.", "It creates shear on the joint.", "ظبّط المسند لحد ما المحور يبقى جنب الركبة.", "Adjust the back rest until the pivot is beside the knee."),
      KNEE_PAIN,
    ],
  },
  hack_squat: {
    en: {
      setup: ["Shoulders under the pads, back against the pad."], steps: ["Lower slowly, then press up."],
      breathing: BREATH_EN, precautions: ["Not added to the program automatically."], guideline: "As advised by a specialist",
      reviewRequired: "High knee load; needs a specialist's assessment before use.",
    },
    start: bi("الكتف تحت الوسادات والظهر على المسند.", "Shoulders under the pads, back on the pad."),
    posture: bi("ظهر ملتصق والركبة على خط الصوابع.", "Back flat, knees over toes."),
    range: bi("يحدده الأخصائي.", "Set by your specialist."),
    mistakes: [
      m("range", "النزول العميق مع ألم", "Going deep through pain", "حمل عالي جدًا على الركبة.", "Very high knee load.", "استخدم دفع الأرجل بمدى قصير بدلًا منه.", "Use the leg press with a short range instead."),
      KNEE_IN,
      HOLD_BREATH("الطلوع", "the drive up"),
    ],
  },
  barbell_back_squat: {
    en: {
      setup: ["Must be learned under a coach's supervision."], steps: ["Not included in the program."],
      breathing: "Breath-holding is sometimes used with heavy loads, which isn't appropriate with high blood pressure without medical advice.",
      precautions: ["Not added to the program automatically."], guideline: "As advised by a coach/specialist",
      reviewRequired: "High load on the knee and spine and an intermediate level; needs assessment and direct supervision.",
    },
    start: bi("البار على أعلى الظهر تحت إشراف مدرب.", "Bar on the upper back under a coach's supervision."),
    posture: bi("ظهر محايد وركبة على خط الصوابع.", "Neutral spine, knees over toes."),
    range: bi("يحدده المدرب حسب حالة الركبة.", "Set by the coach according to your knee."),
    mistakes: [
      m("safety", "التعلم من غير إشراف", "Learning it unsupervised", "خطر إصابة كبير على الركبة والظهر.", "High injury risk for knees and back.", "اتعلمه مع مدرب بعد موافقة الأخصائي.", "Learn it with a coach after your specialist approves."),
      m("breathing", "حبس النفس بأوزان تقيلة", "Holding your breath under heavy load", "بيرفع الضغط جدًا.", "It spikes blood pressure sharply.", "أوزان خفيفة وتنفس منتظم.", "Light loads and steady breathing."),
      KNEE_IN,
    ],
  },
  walking_lunge: {
    en: {
      setup: ["Not included in the program."], steps: ["Step forward and lower under control."],
      breathing: BREATH_EN, precautions: ["Not added to the program automatically."], guideline: "As advised by a specialist",
      reviewRequired: "Deep single-leg knee bending with balance demands; needs a specialist's assessment because of knee osteoarthritis.",
    },
    start: bi("واقف معتدل قبل الخطوة.", "Standing tall before the step."),
    posture: bi("جذع معتدل والركبة الأمامية على خط الصوابع.", "Upright trunk, front knee over the toes."),
    range: bi("يحدده الأخصائي.", "Set by your specialist."),
    mistakes: [
      KNEE_IN,
      m("range", "الركبة الأمامية تعدي الصوابع كتير", "Front knee shooting far past the toes", "بيزود الضغط على مقدمة الركبة.", "It increases pressure on the front of the knee.", "خطوة أطول ونزول لتحت مش لقدام.", "Take a longer step and drop down, not forward."),
      KNEE_PAIN,
    ],
  },

  // ---------------- الفخذ الخلفية ----------------
  seated_leg_curl: {
    en: {
      setup: ["Line up the pivot with your knee.", "Lock the thigh pad over your thighs.", "Lower pad just above the heel."],
      steps: ["Bend the knees to pull the pad down and back.", "Return slowly without snapping the knees straight."],
      breathing: BREATH_EN, precautions: ["If you feel pain behind the knee, shorten the range or reduce the weight."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الفخذ متثبت والوسادة فوق الكعب والرجل مفرودة تقريبًا.", "Thighs locked, pad above the heels, legs nearly straight."),
    posture: bi("ظهر على المسند والحوض ثابت على المقعد.", "Back on the pad, hips fixed on the seat."),
    range: bi("من رجل شبه مفرودة لحد أقصى ثني مريح.", "From nearly straight legs to a comfortable full bend."),
    mistakes: [
      m("posture", "رفع الحوض من على المقعد", "Lifting the hips off the seat", "بيقلل شغل الخلفية وبيحمّل الظهر.", "It reduces hamstring work and loads the back.", "اقفل وسادة الفخذ كويس وقلل الوزن.", "Lock the thigh pad firmly and reduce the weight."),
      m("setup", "المحور مش على الركبة", "Pivot not aligned with the knee", "بيضغط على المفصل.", "It stresses the joint.", "ظبّط المسند لحد ما المحور يبقى جنب الركبة.", "Adjust until the pivot is beside your knee."),
      TOO_FAST,
      HOLD_BREATH("الثني", "the curl"),
    ],
  },
  lying_leg_curl: {
    en: {
      setup: ["Lie face down with the knees just off the pad edge.", "Pad over the ankles."],
      steps: ["Bend the knees.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["If lying face down bothers your back, use the seated version.", "Get up slowly afterwards."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("نايم على بطنك والركبة على حافة الوسادة.", "Face down, knees at the pad edge."),
    posture: bi("الحوض على الجهاز والبطن مشدودة.", "Hips on the pad, abs braced."),
    range: bi("لحد أقصى ثني مريح.", "To a comfortable full bend."),
    mistakes: [
      m("posture", "رفع الحوض وتقويس الظهر", "Lifting the hips and arching the back", "بيضغط على أسفل الظهر.", "It loads the lower back.", "اضغط الحوض في الوسادة وقلل الوزن.", "Press your hips into the pad and lighten up."),
      TOO_FAST,
      GETUP,
    ],
  },
  db_romanian_deadlift: {
    en: {
      setup: ["Only after assessment."], steps: ["Hip hinge with a neutral spine."],
      breathing: BREATH_EN, precautions: ["Not added to the program automatically."], guideline: "As advised by a specialist",
      reviewRequired: "Loads the lower back; the hinge pattern should be learned with a specialist because of the intermittent back pain.",
    },
    start: bi("واقف والدمبلز قدام الفخذ.", "Standing with dumbbells in front of the thighs."),
    posture: bi("ظهر محايد والركبة مثنية شوية.", "Neutral spine, soft knees."),
    range: bi("لحد ما تحس بشد في الخلفية والظهر لسه مفرود.", "Until you feel a hamstring stretch with the back still flat."),
    mistakes: [
      m("posture", "تدوير الظهر", "Rounding the back", "خطر على الفقرات.", "Risky for the spine.", "اتعلمه مع أخصائي.", "Learn it with a specialist."),
      TOO_HEAVY,
      HOLD_BREATH("الطلوع", "standing up"),
    ],
  },
  ball_hamstring_curl: {
    en: {
      setup: ["Lie on your back with your heels on the ball."],
      steps: ["Lift the hips slightly.", "Roll the ball toward you by bending the knees.", "Roll it back slowly."],
      breathing: "Exhale as you pull the ball in.", precautions: ["Start with the hips on the floor if it's hard.", "Get up from the floor slowly."], guideline: "2 sets × 8–10 reps",
    },
    start: bi("نايم على ظهرك والكعب فوق الكرة.", "On your back, heels on the ball."),
    posture: bi("حوض مرفوع شوية وبطن مشدودة.", "Hips slightly lifted, core braced."),
    range: bi("سحب الكرة لحد ما الركبة تبقى 90 درجة تقريبًا.", "Pull the ball in until knees reach about 90°."),
    mistakes: [
      m("posture", "هبوط الحوض", "Hips dropping", "بيقلل شغل الخلفية.", "It reduces hamstring work.", "شد المؤخرة طول الحركة.", "Squeeze your glutes throughout."),
      m("posture", "تقويس الظهر", "Arching the back", "بيحمّل أسفل الظهر.", "It loads the lower back.", "ارفع الحوض لحد خط مستقيم بس.", "Lift the hips only to a straight line."),
      GETUP,
    ],
  },

  // ---------------- المؤخرة والورك ----------------
  glute_bridge: {
    en: {
      setup: ["Lie on your back, knees bent, feet flat hip-width apart."],
      steps: ["Brace lightly, then lift the hips until shoulders–hips–knees form a line.", "Hold one second.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Get up from the floor slowly (sit first, then stand).", "If your back complains, lift less high."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("نايم على ظهرك والركبة مثنية والقدم على الأرض.", "On your back, knees bent, feet flat."),
    posture: bi("بطن مشدودة خفيف والضغط على الكعب.", "Light brace, pressure through the heels."),
    range: bi("لحد ما الكتف والحوض والركبة يبقوا على خط واحد.", "Until shoulders, hips and knees line up."),
    mistakes: [
      m("range", "تقويس أسفل الظهر فوق", "Over-arching at the top", "الظهر بيشتغل بدل المؤخرة.", "The back works instead of the glutes.", "وقف عند الخط المستقيم وشد المؤخرة.", "Stop at a straight line and squeeze the glutes."),
      m("setup", "الدفع بصوابع القدم", "Pushing through the toes", "بيشغّل الفخذ الأمامية بدل المؤخرة.", "It shifts work to the quads.", "ادفع بالكعب.", "Drive through your heels."),
      GETUP,
      HOLD_BREATH("الرفع", "the lift"),
    ],
  },
  hip_thrust_machine: {
    en: {
      setup: ["Set the belt/pad over the hip bones.", "Feet hip-width with knees at about 90° at the top."],
      steps: ["Drive the hips up with the glutes.", "Pause briefly.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Start light to feel the glutes without straining the back."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الحزام على عظمة الحوض والقدم بعرض الحوض.", "Belt over the hip bones, feet hip-width."),
    posture: bi("ذقن لتحت شوية وضلوع لتحت.", "Chin slightly tucked, ribs down."),
    range: bi("لحد ما الجسم يبقى مستقيم من الكتف للركبة.", "Until the body is straight from shoulders to knees."),
    mistakes: [
      m("posture", "تقويس الظهر بدل مد الورك", "Arching the back instead of extending the hips", "بيضغط على أسفل الظهر.", "It loads the lower back.", "فكر إنك بتلف الحوض لتحت وانت فوق.", "Think of tucking the pelvis at the top."),
      m("posture", "الذقن لفوق", "Chin up", "بيزود تقوس الظهر.", "It increases back arching.", "بص لقدام مش للسقف.", "Look forward, not at the ceiling."),
      TOO_HEAVY,
      HOLD_BREATH("الرفع", "the thrust"),
    ],
  },
  hip_abduction_machine: {
    en: {
      setup: ["Sit with your back on the pad and the pads on the outside of the knees."],
      steps: ["Push the legs outward.", "Return slowly without letting the weights crash."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–20 reps",
    },
    start: bi("قاعد والوسادات على الجنب الخارجي للركبة.", "Seated, pads on the outer knees."),
    posture: bi("ظهر على المسند.", "Back on the pad."),
    range: bi("فتح لحد أقصى مدى مريح.", "Open to your comfortable maximum."),
    mistakes: [
      TOO_FAST,
      m("range", "مدى زيادة يضغط على الورك", "Excessive range straining the hip", "بيشد مفصل الورك.", "It strains the hip joint.", "افتح لحد ما تحس بالعضلة شغالة بس.", "Open only as far as you feel the muscle working."),
      m("tempo", "خبط الأوزان في الرجوع", "Letting the weights crash", "بيضيع الشد على العضلة.", "It loses tension on the muscle.", "رجّع ببطء من غير ما الأوزان تلمس.", "Return slowly without the stack touching."),
    ],
  },
  hip_adduction_machine: {
    en: {
      setup: ["Set the start position so you don't feel a painful stretch in the inner thigh."],
      steps: ["Squeeze the legs together.", "Return slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الرجلين مفتوحين لحد مريح.", "Legs open to a comfortable width."),
    posture: bi("ظهر على المسند.", "Back on the pad."),
    range: bi("من وضع مريح لحد ما الرجلين يتقابلوا.", "From a comfortable start until the legs meet."),
    mistakes: [
      m("setup", "فتح زيادة في البداية", "Starting too wide", "بيشد الفخذ الداخلي بقوة.", "It over-stretches the inner thigh.", "قلل نقطة البداية.", "Narrow the start position."),
      TOO_FAST,
      TOO_HEAVY,
    ],
  },
  cable_pull_through: {
    en: {
      setup: ["Pulley at the lowest point with a rope.", "Stand facing away from the machine, two steps forward."],
      steps: ["Hinge from the hips with a straight back.", "Drive the hips forward to stand up."],
      breathing: BREATH_EN, precautions: ["It's a hip-hinge: use a light weight and stop if back pain increases."], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("ضهرك للجهاز والحبل بين رجليك.", "Back to the machine, rope between your legs."),
    posture: bi("ظهر مفرود والركبة مثنية شوية.", "Flat back, soft knees."),
    range: bi("انحناء من الورك لحد شد خفيف في الخلفية.", "Hinge until a light hamstring stretch."),
    mistakes: [
      m("posture", "الشد بالدراعين", "Pulling with the arms", "الدراع بيعمل الشغل بدل المؤخرة.", "The arms do the work instead of the glutes.", "الدراعين حبال بس، والحركة من الورك.", "Arms are just ropes; move from the hips."),
      m("posture", "تدوير الظهر", "Rounding the back", "بيحمّل الفقرات.", "It loads the spine.", "ادفع الحوض لورا والصدر مرفوع.", "Push the hips back with chest up."),
      TOO_HEAVY,
    ],
  },
  band_lateral_walk: {
    en: {
      setup: ["Place the band above the knees or around the ankles (above the knees is easier).", "Bend knees and hips very slightly."],
      steps: ["Take a small side step keeping the band tight.", "Bring the other foot in without touching the first.", "Repeat, then go the other way."],
      breathing: "Breathe steadily.", precautions: ["If knee pain increases, use the hip abduction machine instead."], guideline: "2–3 sets × 10 steps each way",
    },
    start: bi("الحبل فوق الركبة والرجلين بعرض الحوض.", "Band above the knees, feet hip-width."),
    posture: bi("نص قعدة خفيفة جدًا وصدر مرفوع.", "Very slight squat, chest up."),
    range: bi("خطوات صغيرة والحبل مشدود طول الوقت.", "Small steps with the band always taut."),
    mistakes: [
      KNEE_IN,
      m("range", "خطوات كبيرة", "Steps too big", "بتفقد التوازن والشد.", "You lose balance and tension.", "خطوات بعرض شبر تقريبًا.", "Steps about a hand-span wide."),
      m("posture", "الجسم بيتمايل", "Rocking side to side", "العضلة مش بتشتغل كويس.", "The target muscle works less.", "ثبّت الجذع واتحرك بالرجل بس.", "Keep your trunk still and move only the legs."),
    ],
  },

  // ---------------- السمانة ----------------
  seated_calf_raise: {
    en: {
      setup: ["Balls of the feet on the edge, pad over the thighs."],
      steps: ["Raise the heels as high as possible.", "Lower slowly to a comfortable stretch."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–20 reps",
    },
    start: bi("مقدمة القدم على الحافة والوسادة فوق الفخذ.", "Balls of the feet on the edge, pad on the thighs."),
    posture: bi("قاعد معتدل.", "Sitting tall."),
    range: bi("من إطالة مريحة لحد أعلى نقطة.", "From a comfortable stretch to the highest point."),
    mistakes: [
      m("tempo", "الارتداد السريع", "Bouncing quickly", "بيشد وتر أكيليس.", "It strains the Achilles tendon.", "وقف ثانية تحت وثانية فوق.", "Pause one second at the bottom and top."),
      m("range", "نص حركة", "Half reps", "السمانة مش بتشتغل على مداها.", "The calf doesn't work through its range.", "انزل لإطالة مريحة واطلع لآخر حد.", "Lower to a comfortable stretch and rise fully."),
      TOO_HEAVY,
    ],
  },
  standing_calf_machine: {
    en: {
      setup: ["The shoulder pads place load on your spine."],
      steps: ["Raise the heels.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Prefer the seated version if your back is tired."], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الكتف تحت الوسادات ومقدمة القدم على الحافة.", "Shoulders under the pads, balls of the feet on the edge."),
    posture: bi("واقف معتدل والركبة مرتخية.", "Standing tall with soft knees."),
    range: bi("من إطالة مريحة لأعلى نقطة.", "From a comfortable stretch to the top."),
    mistakes: [
      m("posture", "ثني الركبة والدفع بيها", "Bending and pushing with the knees", "الحركة بتتحول من السمانة للفخذ.", "The movement shifts from calves to thighs.", "خلي الركبة شبه مفرودة.", "Keep the knees almost straight."),
      m("safety", "وزن تقيل مع ألم الظهر", "Heavy load with back pain", "الوسادات بتضغط على العمود الفقري.", "The pads compress your spine.", "استخدم السمانة جلوس.", "Use the seated calf raise."),
      TOO_FAST,
    ],
  },
  leg_press_calf_raise: {
    en: {
      setup: ["Balls of the feet on the bottom edge of the platform, keep the safety engaged if possible."],
      steps: ["Push with the balls of your feet.", "Return slowly."],
      breathing: BREATH_EN, precautions: ["Make sure your feet are secure on the platform."], guideline: "2–3 sets × 12–20 reps",
    },
    start: bi("مقدمة القدم على أسفل اللوحة والركبة شبه مفرودة.", "Balls of the feet on the lower platform, knees nearly straight."),
    posture: bi("ظهر وحوض على المسند.", "Back and hips on the pad."),
    range: bi("من إطالة مريحة لحد أقصى دفع بالصوابع.", "From a comfortable stretch to full push through the toes."),
    mistakes: [
      m("safety", "انزلاق القدم من اللوحة", "Feet slipping off the platform", "اللوحة ممكن تنزل فجأة.", "The platform can drop suddenly.", "ثبّت القدم كويس واقفل الأمان لو متاح.", "Set your feet firmly and keep the safety on if available."),
      TOO_FAST,
      m("posture", "ثني الركبة", "Bending the knees", "الحركة بتتحول لدفع أرجل.", "It turns into a leg press.", "خلي الركبة شبه مفرودة.", "Keep the knees nearly straight."),
    ],
  },
  standing_calf_raise_bw: {
    en: {
      setup: ["Stand next to a wall or machine for support."],
      steps: ["Raise the heels.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 15–20 reps",
    },
    start: bi("واقف جنب الحيطة وإيدك عليها.", "Standing by a wall, hand on it."),
    posture: bi("جسم معتدل والوزن على مقدمة القدم.", "Tall body, weight over the balls of the feet."),
    range: bi("لأعلى نقطة وبعدين للأرض ببطء.", "To the highest point and slowly back down."),
    mistakes: [TOO_FAST, m("posture", "الميل لقدام", "Leaning forward", "بيقلل شغل السمانة.", "It reduces calf work.", "قف معتدل.", "Stand tall."), m("range", "نص حركة", "Half reps", "مدى أقل = فايدة أقل.", "Less range, less benefit.", "اطلع لآخر حد.", "Rise all the way.")],
  },

  // ---------------- البطن والجذع ----------------
  dead_bug: {
    en: {
      setup: ["Lie on your back with arms up and knees at 90° above the hips."],
      steps: ["Gently press your lower back toward the floor.", "Slowly extend one leg (and the opposite arm if you can) without your back arching.", "Return and switch sides."],
      breathing: "Breathe steadily; exhale as the leg extends.", precautions: ["Start with leg movement only if it's hard.", "Get up from the floor slowly."], guideline: "2–3 sets × 6–10 per side",
    },
    start: bi("نايم على ظهرك والدراعين لفوق والركبة 90 درجة.", "On your back, arms up, knees at 90°."),
    posture: bi("أسفل الظهر لازق في الأرض.", "Lower back stays on the floor."),
    range: bi("مد الرجل لحد ما الظهر يبدأ يتقوس وبس.", "Extend the leg only until the back starts to arch."),
    mistakes: [
      m("posture", "تقوس أسفل الظهر", "Lower back arching", "بيلغي شغل البطن وبيضغط على الظهر.", "It turns off the abs and loads the back.", "قصّر مد الرجل.", "Shorten the leg reach."),
      HOLD_BREATH("مد الرجل", "the leg reach"),
      TOO_FAST,
      GETUP,
    ],
  },
  bird_dog: {
    en: {
      setup: ["On hands and knees. Place a cushion or thick mat under the knees."],
      steps: ["Slowly extend one arm and the opposite leg while keeping the pelvis still.", "Hold 2–3 seconds.", "Return and switch."],
      breathing: "Breathe steadily while holding.", precautions: ["If kneeling bothers your knee, swap for dead bug or Pallof press."], guideline: "2–3 sets × 6–8 per side",
    },
    start: bi("على اليدين والركبتين، والإيد تحت الكتف والركبة تحت الورك.", "On hands and knees, hands under shoulders, knees under hips."),
    posture: bi("ظهر مستقيم زي الترابيزة.", "Flat back like a table top."),
    range: bi("مد الدراع والرجل لحد مستوى الجسم بس.", "Extend arm and leg only to body level."),
    mistakes: [
      m("posture", "تقويس الظهر", "Arching the back", "بيضغط على أسفل الظهر.", "It loads the lower back.", "ارفع الرجل لمستوى الحوض بس.", "Lift the leg only to hip height."),
      m("posture", "لف الحوض", "Rotating the pelvis", "بيضيع هدف التمرين (الثبات).", "It defeats the purpose (stability).", "تخيل كوباية مية على ضهرك.", "Imagine a glass of water on your back."),
      m("setup", "الركوع على أرض قاسية", "Kneeling on a hard floor", "بيضايق الركبة.", "It irritates the knee.", "حط وسادة سميكة تحت الركبة.", "Put a thick cushion under the knees."),
    ],
  },
  pallof_press: {
    en: {
      setup: ["Pulley at chest height, stand side-on to the machine.", "Hold the handle at your chest with both hands."],
      steps: ["Press the handle forward and resist the twist.", "Hold 2 seconds, then return."],
      breathing: "Exhale as you press and keep breathing.", precautions: [], guideline: "2–3 sets × 8–12 per side",
    },
    start: bi("واقف جنب الجهاز والمقبض قدام الصدر.", "Side-on to the machine, handle at the chest."),
    posture: bi("رجلين بعرض الكتف وبطن مشدودة.", "Feet shoulder-width, core braced."),
    range: bi("فرد الدراعين لقدام بالكامل.", "Fully extend the arms forward."),
    mistakes: [
      m("posture", "لف الجذع", "Twisting the trunk", "الهدف إنك تقاوم اللف.", "The goal is to resist rotation.", "قلل الوزن وثبّت الحوض والكتف.", "Lighten the load and square your hips and shoulders."),
      m("setup", "الوقوف قريب جدًا", "Standing too close", "الشد بيبقى ضعيف.", "There's too little tension.", "ابعد خطوة عن الجهاز.", "Step further away from the machine."),
      HOLD_BREATH("الثبات", "the hold"),
    ],
  },
  side_plank_knees: {
    en: {
      setup: ["Lie on your side, elbow under the shoulder, knees bent."],
      steps: ["Lift the hips so the body forms a line from head to knees.", "Hold while breathing."],
      breathing: "Breathe normally throughout the hold; don't hold your breath.", precautions: ["Holds can raise blood pressure if you hold your breath; talk or count quietly."], guideline: "2–3 sets × 15–30 s per side",
    },
    start: bi("نايم على جنبك والكوع تحت الكتف.", "On your side, elbow under the shoulder."),
    posture: bi("رأس وحوض وركبة على خط واحد.", "Head, hips and knees in one line."),
    range: bi("ثبات من غير ما الحوض ينزل.", "Hold without the hips sagging."),
    mistakes: [
      m("posture", "هبوط الحوض", "Hips sagging", "البطن بتبطل شغل.", "The core switches off.", "ارفع الحوض وقصّر الوقت.", "Lift the hips and shorten the hold."),
      HOLD_BREATH("الثبات", "the hold"),
      m("posture", "الكوع بعيد عن الكتف", "Elbow away from the shoulder", "بيضغط على الكتف.", "It strains the shoulder.", "خلي الكوع تحت الكتف بالظبط.", "Stack the elbow directly under the shoulder."),
      GETUP,
    ],
  },
  incline_plank: {
    en: {
      setup: ["Forearms or hands on a stable bench, body in a straight line."],
      steps: ["Tighten your abs and glutes.", "Hold with normal breathing."],
      breathing: "Breathe normally throughout the hold.", precautions: ["Start with short holds."], guideline: "2–3 sets × 15–30 s",
    },
    start: bi("الإيدين على بنش ثابت والجسم مستقيم.", "Hands on a stable bench, body straight."),
    posture: bi("بطن ومؤخرة مشدودين.", "Abs and glutes tight."),
    range: bi("ثبات بدون حركة.", "Static hold."),
    mistakes: [
      m("posture", "هبوط الحوض", "Hips sagging", "بيضغط على أسفل الظهر.", "It loads the lower back.", "شد المؤخرة.", "Squeeze your glutes."),
      HOLD_BREATH("الثبات", "the hold"),
      m("posture", "رفع الحوض لفوق", "Hips piking up", "بيقلل شغل البطن.", "It reduces core work.", "خلي الجسم خط مستقيم.", "Keep the body in a straight line."),
    ],
  },
  farmer_walk: {
    en: {
      setup: ["Pick the dumbbells up from a rack or bench to avoid bending to the floor."],
      steps: ["Walk with short, steady steps and an upright body.", "Put the dumbbells back on the bench, not the floor."],
      breathing: "Breathe steadily while walking.", precautions: ["Moderate weights only; stop if back or knee pain increases."], guideline: "2–3 sets × 20–30 m",
    },
    start: bi("دمبل في كل إيد وواقف معتدل.", "A dumbbell in each hand, standing tall."),
    posture: bi("كتف لتحت ولورا وجسم منتصب.", "Shoulders down and back, upright body."),
    range: bi("مشي لمسافة قصيرة بخطوات ثابتة.", "Walk a short distance with steady steps."),
    mistakes: [
      m("posture", "الميل لجهة واحدة", "Leaning to one side", "بيحمّل جنب واحد من الظهر.", "It loads one side of the back.", "وزنين متساويين وجسم معتدل.", "Equal weights and an upright body."),
      m("safety", "رفع الدمبلز من الأرض بظهر مدوّر", "Lifting from the floor with a rounded back", "خطر على أسفل الظهر.", "Risky for the lower back.", "ارفعها من على بنش.", "Pick them up from a bench."),
      TOO_HEAVY,
    ],
  },
  cable_crunch: {
    en: {
      setup: ["Not included in the program."], steps: ["Flex the trunk downward."],
      breathing: BREATH_EN, precautions: ["Not added to the program automatically."], guideline: "As advised by a specialist",
      reviewRequired: "Loaded spinal flexion while kneeling; needs review because of back and knee pain.",
    },
    start: bi("راكع قدام الجهاز والحبل جنب الرأس.", "Kneeling in front of the machine, rope by the head."),
    posture: bi("الحوض ثابت.", "Hips stay still."),
    range: bi("يحدده الأخصائي.", "Set by your specialist."),
    mistakes: [
      m("posture", "الشد بالدراعين", "Pulling with the arms", "البطن مش بتشتغل.", "The abs don't work.", "الدراعين ثابتين جنب الرأس.", "Keep the arms fixed beside your head."),
      m("safety", "الركوع مع ألم الركبة", "Kneeling with knee pain", "ضغط مباشر على الركبة.", "Direct pressure on the knee.", "استخدم بالوف برس أو الحشرة الميتة.", "Use the Pallof press or dead bug."),
      TOO_HEAVY,
    ],
  },
  kettlebell_suitcase_carry: {
    en: {
      setup: ["Lift the kettlebell from a bench or box instead of the floor."],
      steps: ["Walk with short steps, staying upright without leaning to the side.", "Switch hands on the way back."],
      breathing: "Breathe steadily while walking.", precautions: ["Light to moderate weight only."], guideline: "2–3 sets × 20 m per hand",
    },
    start: bi("الكيتل بيل في إيد واحدة وواقف معتدل.", "Kettlebell in one hand, standing tall."),
    posture: bi("الكتفين على مستوى واحد.", "Shoulders level."),
    range: bi("مشي لمسافة قصيرة.", "Walk a short distance."),
    mistakes: [
      m("posture", "الميل ناحية الوزن", "Leaning toward the weight", "بيضيع فايدة التمرين وبيحمّل الظهر.", "It defeats the purpose and loads the back.", "فكر إنك بتطول من الجنب التاني.", "Think of growing tall on the opposite side."),
      m("safety", "رفعه من الأرض بظهر مدوّر", "Lifting it from the floor with a rounded back", "خطر على الظهر.", "Risky for the back.", "ارفعه من بنش.", "Lift it from a bench."),
      TOO_HEAVY,
    ],
  },

  // ---------------- الكارديو والمرونة ----------------
  treadmill_walk: {
    en: {
      setup: ["Start at a comfortable speed with zero or low incline (0–3%).", "Clip on the safety key if there is one."],
      steps: ["Walk with natural steps without gripping the handles hard.", "Increase the incline gradually only if your knee is comfortable."],
      breathing: TALK, precautions: ["Slow down gradually before stepping off to avoid dizziness."], guideline: "10–30 min at light to moderate effort",
    },
    start: bi("واقف على الجوانب، شغّل على سرعة بطيئة وبعدين ادخل.", "Stand on the side rails, start slow, then step on."),
    posture: bi("جسم معتدل وبص قدامك.", "Upright body, eyes forward."),
    range: bi("خطوة طبيعية مش طويلة زيادة.", "A natural, not over-long, stride."),
    mistakes: [
      RAIL,
      m("setup", "ميل عالي من البداية", "High incline from the start", "بيزود الحمل على الركبة.", "It increases knee load.", "ابدأ بميل 0-2% وزوّد بالتدريج.", "Start at 0–2% and build gradually."),
      m("safety", "النزول من غير ما تبطّأ", "Stepping off without slowing down", "ممكن تدوخ، خصوصًا مع دواء الضغط.", "You can get dizzy, especially on BP medication.", "بطّأ دقيقتين قبل ما تقف.", "Slow down for two minutes before stopping."),
    ],
  },
  recumbent_bike: {
    en: {
      setup: ["Set the seat so the knee stays slightly bent at the farthest point.", "Start with low resistance."],
      steps: ["Pedal at a steady, comfortable cadence.", "Increase resistance gradually by effort."],
      breathing: TALK, precautions: [], guideline: "10–30 min at light to moderate effort",
    },
    start: bi("قاعد والظهر على المسند والرجل على البدال.", "Seated, back on the rest, feet on the pedals."),
    posture: bi("ظهر مسنود وكتف مرتاح.", "Back supported, relaxed shoulders."),
    range: bi("الركبة مثنية شوية في أبعد نقطة.", "Knee slightly bent at full extension."),
    mistakes: [
      m("setup", "مقعد قريب جدًا", "Seat too close", "بيزود ثني الركبة والضغط عليها.", "It increases knee bend and pressure.", "ابعد المقعد لحد ما الركبة تبقى شبه مفرودة.", "Move the seat back until the knee is nearly straight."),
      m("setup", "مقاومة عالية وسرعة بطيئة", "High resistance at low cadence", "بيحمّل الركبة.", "It loads the knee.", "مقاومة أقل وسرعة أعلى.", "Less resistance, faster cadence."),
      m("safety", "الوقوف فجأة بعد الكارديو", "Stopping abruptly", "ممكن دوخة.", "It can cause dizziness.", "دقيقتين تهدئة.", "Cool down for two minutes."),
    ],
  },
  upright_bike: {
    en: {
      setup: ["Seat height so the knee stays slightly bent at the bottom."],
      steps: ["Pedal at a steady cadence.", "Sit as upright as you can."],
      breathing: TALK, precautions: ["If it bothers your back, use the recumbent bike."], guideline: "10–30 min",
    },
    start: bi("قاعد والإيد على المقود بخفة.", "Seated with hands lightly on the bars."),
    posture: bi("ظهر معتدل قدر الإمكان.", "As upright as possible."),
    range: bi("ركبة مثنية شوية تحت.", "Knee slightly bent at the bottom."),
    mistakes: [
      m("setup", "مقعد واطي", "Seat too low", "ثني زيادة في الركبة.", "Too much knee bend.", "ارفع المقعد لمستوى الورك.", "Raise the seat to hip height."),
      m("posture", "الانحناء الشديد على المقود", "Hunching over the bars", "بيحمّل الظهر.", "It loads the back.", "ارفع المقود أو استخدم العجلة بمسند.", "Raise the bars or use the recumbent bike."),
      m("setup", "مقاومة عالية", "Resistance too high", "بيحمّل الركبة.", "It loads the knee.", "مقاومة خفيفة.", "Light resistance."),
    ],
  },
  elliptical: {
    en: {
      setup: ["Start with low resistance.", "Hold the fixed handles if you need balance."],
      steps: ["Move smoothly without lifting the heels much.", "Keep the trunk upright."],
      breathing: TALK, precautions: [], guideline: "10–30 min",
    },
    start: bi("واقف على الدواسات والإيد على المقابض.", "Standing on the pedals, hands on the handles."),
    posture: bi("جذع معتدل وكتف مرتاح.", "Upright trunk, relaxed shoulders."),
    range: bi("حركة سلسة من غير قفز.", "Smooth motion, no bouncing."),
    mistakes: [
      m("posture", "الاعتماد على الدراعين بالكامل", "Relying entirely on the arms", "الرجل بتشتغل أقل والكتف بيتعب.", "Legs work less and shoulders tire.", "وزّع الشغل والرجلين هما الأساس.", "Share the work; legs lead."),
      RAIL,
      m("safety", "الوقوف فجأة", "Stopping abruptly", "ممكن دوخة.", "It can cause dizziness.", "هدّي السرعة تدريجيًا.", "Slow down gradually."),
    ],
  },
  rowing_machine: {
    en: {
      setup: ["Low resistance."], steps: ["Legs, then trunk, then arms."],
      breathing: "Breathe steadily.", precautions: ["Not added to the program automatically."], guideline: "As assessed",
      reviewRequired: "Needs good technique to protect the lower back and requires deep knee bending; best learned with a coach first.",
    },
    start: bi("قاعد والركبة مثنية والدراع مفرود.", "Seated, knees bent, arms straight."),
    posture: bi("ظهر محايد.", "Neutral spine."),
    range: bi("يحدده المدرب.", "Set by your coach."),
    mistakes: [
      m("posture", "تدوير الظهر", "Rounding the back", "ضغط على أسفل الظهر.", "Stress on the lower back.", "اتعلم التقنية مع مدرب.", "Learn the technique with a coach."),
      m("tempo", "السحب بالدراعين الأول", "Pulling with the arms first", "التسلسل غلط والظهر بيتعب.", "Wrong sequence, back fatigue.", "الرجلين الأول ثم الجذع ثم الدراعين.", "Legs first, then trunk, then arms."),
      KNEE_PAIN,
    ],
  },
  stair_climber: {
    en: {
      setup: ["Very slow speed at first."], steps: ["Step with the whole foot without leaning on the handles."],
      breathing: TALK, precautions: ["Not added to the program automatically."], guideline: "As assessed",
      reviewRequired: "Repeated stepping with high knee load; needs a specialist's approval with knee osteoarthritis.",
    },
    start: bi("واقف على السلم والإيد على المقابض بخفة.", "On the steps, hands lightly on the rails."),
    posture: bi("جسم معتدل.", "Upright body."),
    range: bi("خطوة كاملة بالقدم.", "Full-foot steps."),
    mistakes: [RAIL, KNEE_PAIN, m("setup", "سرعة عالية", "Speed too high", "بيزود الحمل على الركبة.", "It increases knee load.", "أبطأ سرعة.", "Use the slowest speed.")],
  },
  foam_roll_quads: {
    en: {
      setup: ["Rest on your forearms with the roller under the front of the thigh."],
      steps: ["Slowly roll from above the knee to the top of the thigh.", "30–60 seconds per leg."],
      breathing: "Breathe slowly and calmly.", precautions: ["Don't roll directly over the knee.", "Get up from the floor slowly."], guideline: "30–60 s per leg after training",
    },
    start: bi("مستند على الساعدين والرول تحت الفخذ.", "On your forearms, roller under the thigh."),
    posture: bi("بطن مشدودة وظهر مستقيم.", "Braced core, straight back."),
    range: bi("من فوق الركبة بشبر لحد أعلى الفخذ.", "From a hand-span above the knee to the top of the thigh."),
    mistakes: [
      m("safety", "الرول فوق الركبة", "Rolling over the kneecap", "ضغط مباشر على المفصل.", "Direct pressure on the joint.", "ابدأ فوق الركبة بشبر.", "Start a hand-span above the knee."),
      TOO_FAST,
      GETUP,
    ],
  },
};
