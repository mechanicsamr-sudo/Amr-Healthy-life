import { bi, HOLD_BREATH, m, TOO_FAST, TOO_HEAVY, type ContentMap } from "./helpers";

const BREATH_EN = "Exhale during the effort (push/pull) and inhale on the way back. Don't hold your breath.";

const SHRUG = m("posture", "رفع الكتفين ناحية الودن", "Shrugging the shoulders",
  "بيشغّل عضلات الرقبة بدل العضلة المستهدفة وممكن يضايق الكتف.", "It loads the neck instead of the target muscle and can irritate the shoulder.",
  "نزّل كتفك لتحت ولورا قبل كل تكرار وخليهم ثابتين.", "Set your shoulders down and back before each rep and keep them there.");

export const UPPER: ContentMap = {
  // ---------------- الصدر ----------------
  machine_chest_press: {
    en: {
      setup: ["Set the seat so the handles line up with mid-chest.", "Keep your whole back against the pad and feet flat.", "If there's a start-position lever, choose a comfortable shoulder stretch."],
      steps: ["Grip the handles with elbows slightly below shoulder level (about 45° from the body).", "Press forward until the arms are nearly straight without snapping the elbows.", "Return slowly (2–3 s) to a comfortable chest stretch."],
      breathing: BREATH_EN, precautions: ["Stop if you feel pain at the front of the shoulder."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("المقابض بمستوى منتصف الصدر، والظهر ملتصق بالمسند، والكوع لتحت شوية.", "Handles at mid-chest, back flat on the pad, elbows slightly down."),
    posture: bi("صدر مرفوع، وكتف لتحت ولورا، ورجلين ثابتين على الأرض.", "Chest up, shoulders down and back, feet planted."),
    range: bi("ادفع لحد ما الدراع يقرب يتفرد، وارجع لحد إحساس شد خفيف في الصدر بس.", "Press until arms are almost straight; return only to a light chest stretch."),
    mistakes: [
      m("setup", "مقعد واطي أو عالي جدًا", "Seat too low or too high", "المقبض لو مش على مستوى الصدر الحمل بيروح للكتف.", "If handles aren't at chest level the load shifts to the shoulders.", "ظبّط المقعد لحد ما المقبض ييجي على منتصف الصدر.", "Adjust the seat until the handles meet mid-chest."),
      m("posture", "ظهرك بيبعد عن المسند", "Back leaving the pad", "بتقوّس أسفل الظهر وبتقلل ثبات الحركة.", "It arches the lower back and reduces stability.", "خلي ظهرك ورأسك على المسند طول المجموعة.", "Keep your back and head on the pad for the whole set."),
      m("range", "قفل الكوع بعنف", "Snapping the elbows locked", "الضغط بيروح لمفصل الكوع بدل عضلة الصدر.", "Stress goes into the elbow joint instead of the chest.", "وقف قبل الفرد الكامل بشوية.", "Stop just short of full lockout."),
      SHRUG,
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  incline_machine_press: {
    en: {
      setup: ["Set the seat so the handles line up with the upper chest.", "Back on the pad, feet on the floor."],
      steps: ["Press the handles forward and slightly up under control.", "Stop before the elbows lock.", "Lower slowly to a comfortable shoulder position."],
      breathing: BREATH_EN, precautions: ["If your shoulder feels tight, shorten the range."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("المقابض على مستوى أعلى الصدر والظهر على المسند.", "Handles at upper-chest level, back on the pad."),
    posture: bi("صدر مرفوع وكتف ثابت لتحت.", "Chest lifted, shoulders set down."),
    range: bi("مدى متوسط مريح للكتف، من غير ما الكوع يرجع ورا الجسم كتير.", "A moderate, shoulder-friendly range; elbows don't travel far behind the body."),
    mistakes: [
      m("posture", "تقويس أسفل الظهر لرفع وزن أكبر", "Arching the lower back to lift more", "بيحوّل التمرين لصدر سفلي وبيضغط على الظهر.", "It turns it into a flat press and strains the lower back.", "قلل الوزن وخلي ظهرك على المسند.", "Reduce the weight and keep your back on the pad."),
      m("range", "نزول عميق يضغط على الكتف", "Going too deep and straining the shoulder", "مقدمة الكتف بتتمط زيادة عن اللزوم.", "The front of the shoulder gets over-stretched.", "ارجع لحد ما الإيد تكون على مستوى الصدر تقريبًا.", "Return only until your hands are roughly level with your chest."),
      SHRUG,
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  db_bench_press: {
    en: {
      setup: ["Sit on the end of the bench with dumbbells on your thighs, then lie back slowly keeping them close to your chest.", "Feet flat on the floor or on the bench end if that's easier on your back."],
      steps: ["Press the dumbbells up over your chest keeping wrists straight.", "Lower slowly until elbows reach about bench level.", "Finish by bringing the dumbbells to your chest, then your thighs, before sitting up."],
      breathing: BREATH_EN, precautions: ["Sit up slowly after lying down to avoid dizziness.", "Start light to learn control."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("مستلقي، الدمبلز فوق الصدر والرسغ مستقيم، والقدم على الأرض.", "Lying down, dumbbells over the chest, wrists straight, feet planted."),
    posture: bi("لوحي الكتف مضمومين ومثبتين في البنش، وأسفل الظهر بتقوس طبيعي خفيف.", "Shoulder blades pinned to the bench, natural slight arch in the lower back."),
    range: bi("انزل لحد ما الكوع يبقى على مستوى البنش تقريبًا.", "Lower until elbows are roughly level with the bench."),
    mistakes: [
      m("safety", "رمي الدمبلز على الأرض في الآخر", "Dropping the dumbbells at the end", "بيلف الكتف بقوة وممكن يأذيك أو حد جنبك.", "It wrenches the shoulder and can hurt you or someone nearby.", "رجّع الدمبلز للصدر ثم للفخذ واقعد ببطء.", "Bring them back to your chest, then thighs, and sit up slowly."),
      m("range", "الكوع ينزل تحت البنش كتير", "Elbows dropping far below the bench", "بيمط مقدمة الكتف بزيادة.", "It over-stretches the front of the shoulder.", "وقف لما الكوع يوصل مستوى البنش.", "Stop when elbows reach bench level."),
      m("posture", "الكوع مفتوح 90 درجة على الجنب", "Elbows flared out at 90°", "الوضع ده بيضغط على مفصل الكتف.", "This position stresses the shoulder joint.", "خلي الكوع حوالي 45 درجة من الجسم.", "Keep elbows about 45° from your torso."),
      m("safety", "القيام بسرعة بعد الاستلقاء", "Sitting up too quickly", "مع دواء الضغط ممكن تحس بدوخة.", "On BP medication this can cause dizziness.", "اقعد الأول ثانيتين وبعدين قوم.", "Sit for a couple of seconds before standing."),
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  incline_db_press: {
    en: {
      setup: ["Set the bench to about 30°.", "Keep your whole back on the bench."],
      steps: ["Press the dumbbells up over the upper chest.", "Lower slowly with a comfortable elbow angle.", "Keep wrists straight."],
      breathing: BREATH_EN, precautions: ["Avoid heavy loads until control is solid."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("البنش 30 درجة والدمبلز فوق أعلى الصدر.", "Bench at 30°, dumbbells above the upper chest."),
    posture: bi("ظهر كامل على البنش وكتف مثبت.", "Whole back on the bench, shoulders set."),
    range: bi("انزل لحد مستوى الكتف تقريبًا من غير ما تحس بضغط في مقدمته.", "Lower to about shoulder level without pinching at the front of the shoulder."),
    mistakes: [
      m("setup", "زاوية البنش عالية جدًا", "Bench angle too steep", "بتحوّل التمرين لكتف أكتر من صدر.", "It turns the movement into a shoulder press.", "خليها حوالي 30 درجة.", "Keep it around 30°."),
      m("tempo", "خبط الدمبلز في بعض فوق", "Clanging the dumbbells at the top", "بيضيّع الشد على العضلة وبيهز الكتف.", "It removes tension from the muscle and jolts the shoulder.", "وقف والدمبلز قريبة من بعض من غير ما تتلامس.", "Stop with the dumbbells close but not touching."),
      TOO_HEAVY,
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  pec_deck: {
    en: {
      setup: ["Set the seat so the handles are at chest height.", "Set the start position so your arms don't travel behind your body."],
      steps: ["Bring the arms together in front of the chest in an arc with a slight elbow bend.", "Squeeze the chest briefly.", "Return slowly without letting the hands go past shoulder line."],
      breathing: BREATH_EN, precautions: ["Stop if you feel pain at the front of the shoulder."], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الإيدين على مستوى الصدر والكوع مثني شوية.", "Hands at chest height, elbows softly bent."),
    posture: bi("ظهر على المسند وصدر مرفوع.", "Back on the pad, chest lifted."),
    range: bi("من مستوى الكتف لقدام الصدر، من غير ما الإيد ترجع ورا الكتف.", "From shoulder line to in front of the chest; hands never behind the shoulders."),
    mistakes: [
      m("range", "رجوع الدراع ورا الجسم", "Letting the arms go behind the body", "بيمط الكتف بزيادة وده أكتر سبب لألمه في التمرين ده.", "It over-stretches the shoulder—the most common cause of pain here.", "ظبّط نقطة البداية بحيث الإيد تقف على خط الكتف.", "Set the start so your hands stop at shoulder line."),
      m("posture", "فرد الكوع بالكامل", "Locking the elbows straight", "بيحمّل مفصل الكوع والكتف.", "It loads the elbow and shoulder joints.", "خلي الكوع مثني ثني خفيف ثابت.", "Keep a fixed, slight elbow bend."),
      TOO_FAST,
      HOLD_BREATH("الضم", "the squeeze"),
    ],
  },
  cable_fly: {
    en: {
      setup: ["Set both pulleys at shoulder height or a little higher.", "Stand in a split stance and brace your trunk."],
      steps: ["Bring your hands together in front of the chest in an arc.", "Return slowly keeping a slight bend in the elbows."],
      breathing: BREATH_EN, precautions: ["If standing bothers your back, use the seated pec deck."], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("خطوة لقدام، الإيدين على مستوى الكتف والكوع مثني شوية.", "Split stance, hands at shoulder height, elbows slightly bent."),
    posture: bi("جذع ثابت ومائل لقدام ميلة خفيفة بس.", "Braced trunk with only a slight forward lean."),
    range: bi("لحد ما الإيدين يتقابلوا قدام الصدر، والرجوع لخط الكتف.", "Until hands meet in front of the chest; return to shoulder line."),
    mistakes: [
      m("posture", "الانحناء لقدام كتير", "Leaning forward too much", "بيحمّل أسفل الظهر وبيغير العضلة المستهدفة.", "It loads the lower back and changes the target muscle.", "قف أعدل وثبّت بطنك.", "Stand taller and brace your core."),
      m("range", "ثني الكوع بزيادة", "Bending the elbows too much", "التمرين بيتحول لضغط وبيقل شغل الصدر.", "It turns into a press and the chest works less.", "ثبّت ثني خفيف في الكوع من الأول للآخر.", "Lock in a slight elbow bend throughout."),
      m("range", "الإيد ترجع ورا الكتف", "Hands travelling behind the shoulders", "ضغط زيادة على مقدمة الكتف.", "Extra stress on the front of the shoulder.", "وقف لما الإيد توصل خط الجسم.", "Stop when hands reach your body line."),
      HOLD_BREATH("الضم", "the squeeze"),
    ],
  },
  incline_pushup: {
    en: {
      setup: ["Place hands on a stable bench edge or a high Smith bar.", "The higher the hands, the easier it is."],
      steps: ["Make your body a straight line from head to heels.", "Lower your chest toward the edge slowly.", "Push back up."],
      breathing: BREATH_EN, precautions: ["Make sure the surface is stable and won't slide."], guideline: "2–3 sets × 8–15 reps",
    },
    start: bi("الإيدين على حافة ثابتة بعرض الكتف والجسم خط مستقيم.", "Hands shoulder-width on a stable edge, body in a straight line."),
    posture: bi("بطن مشدودة ومؤخرة مشدودة، والرأس على امتداد الظهر.", "Abs and glutes tight, head in line with the spine."),
    range: bi("انزل لحد ما الصدر يقرب من الحافة.", "Lower until your chest nears the edge."),
    mistakes: [
      m("posture", "الحوض بينزل لتحت", "Hips sagging", "بيقوّس أسفل الظهر وبيضغط عليه.", "It arches and strains the lower back.", "شد بطنك ومؤخرتك كأنك لوح خشب.", "Tighten abs and glutes like a plank."),
      m("posture", "رفع الحوض لفوق", "Piking the hips up", "بيقلل شغل الصدر.", "It reduces chest work.", "خلي الكتف والحوض والكعب على خط واحد.", "Keep shoulders, hips and heels in one line."),
      m("setup", "سطح غير ثابت", "Unstable surface", "ممكن يتزحلق وتقع.", "It can slide and cause a fall.", "استخدم بنش ثابت أو بار سميث مقفول.", "Use a fixed bench or a locked Smith bar."),
      HOLD_BREATH("الدفع", "the push"),
    ],
  },
  smith_bench_press: {
    en: {
      setup: ["Position the bench so the bar lowers onto mid-chest.", "Set the safety stops just above chest height.", "Start with the empty bar."],
      steps: ["Rotate the bar to unhook it.", "Lower slowly to the upper chest.", "Press up without snapping the elbows.", "Re-hook the bar at the end."],
      breathing: BREATH_EN, precautions: ["Always set the safety stops.", "Sit up slowly after lying down."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("البار فوق منتصف الصدر ومسامير الأمان متظبطة.", "Bar over mid-chest with safety stops set."),
    posture: bi("لوحي الكتف مثبتين والقدم على الأرض.", "Shoulder blades set, feet planted."),
    range: bi("نزول لحد ما البار يقرب من الصدر من غير ما يخبط.", "Lower until the bar nears the chest without bouncing."),
    mistakes: [
      m("setup", "البنش في مكان غلط", "Bench in the wrong spot", "البار بينزل على الرقبة أو البطن.", "The bar lands on the neck or belly.", "جرّب بالبار فاضي الأول وظبّط مكان البنش.", "Test with an empty bar and adjust the bench."),
      m("safety", "نسيان مسامير الأمان", "Skipping the safety stops", "لو تعبت مش هتعرف ترجّع البار.", "If you fail a rep you can't re-rack.", "ثبّت المسامير أعلى الصدر بشوية قبل كل مجموعة.", "Set the stops just above chest height before every set."),
      m("posture", "رفع الحوض من على البنش", "Lifting the hips off the bench", "بيضغط على أسفل الظهر.", "It strains the lower back.", "خلي الحوض على البنش وقلل الوزن.", "Keep hips down and lighten the load."),
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  barbell_bench_press: {
    en: {
      setup: ["Lie with your eyes under the bar.", "Use a spotter or a safe rack setup.", "Grip a little wider than shoulder width."],
      steps: ["Unrack with straight arms.", "Lower slowly to mid-chest.", "Press up with elbows at roughly 45°."],
      breathing: "Breathe steadily; with high blood pressure, don't hold your breath even on heavier sets.",
      precautions: ["Intermediate level: best after mastering the machine chest press.", "Don't train it alone with heavy loads."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("العين تحت البار والقبضة أعرض من الكتف.", "Eyes under the bar, grip slightly wider than shoulders."),
    posture: bi("لوحي الكتف مضمومين، والقدم ثابتة، والحوض على البنش.", "Shoulder blades squeezed, feet planted, hips on the bench."),
    range: bi("البار يلمس منتصف الصدر بخفة ويطلع.", "Bar lightly touches mid-chest and goes back up."),
    mistakes: [
      m("tempo", "ارتداد البار من على الصدر", "Bouncing the bar off the chest", "بيخبط القفص الصدري ويبوّظ التحكم.", "It hits the ribcage and kills control.", "انزل ببطء ووقف لحظة خفيفة.", "Lower slowly with a brief pause."),
      m("posture", "رفع الحوض", "Lifting the hips", "بيقوّس الظهر بشدة.", "It over-arches the back.", "قلل الوزن وثبّت الحوض.", "Reduce load and keep the hips down."),
      m("safety", "التمرين لوحدك بوزن تقيل", "Training heavy without a spotter", "ممكن البار يقع عليك.", "The bar could get stuck on you.", "استخدم سبوتر أو جهاز سميث بمسامير أمان.", "Use a spotter or a Smith machine with safeties."),
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  decline_db_press: {
    en: {
      setup: ["Bench set to a decline with feet secured under the pad."], steps: ["Press the dumbbells up, then lower slowly."],
      breathing: "Exhale while pressing. Don't hold your breath.", precautions: ["Not added to the program automatically."], guideline: "As advised by your doctor/coach",
      reviewRequired: "Your head is below your heart on a decline bench; with blood-pressure medication, ask your doctor first.",
    },
    start: bi("مستلقي على بنش منحدر والقدم مثبتة.", "Lying on a decline bench with feet secured."),
    posture: bi("كتف مثبت في البنش.", "Shoulders set into the bench."),
    range: bi("مدى متوسط مريح للكتف.", "A moderate, shoulder-friendly range."),
    mistakes: [
      m("safety", "القيام بسرعة بعد البنش المنحدر", "Getting up quickly from the decline", "الدم بيرجع بسرعة وممكن دوخة، خصوصًا مع دواء الضغط.", "Blood shifts quickly and can cause dizziness, especially on BP medication.", "اقعد ببطء واستنى قبل ما تقوم.", "Sit up slowly and wait before standing."),
      m("safety", "استخدامه من غير سؤال الطبيب", "Using it without medical advice", "وضع الرأس لتحت مش مناسب لكل حالات الضغط.", "Head-down positions aren't suitable for every blood-pressure case.", "اسأل طبيبك، واستخدم ضغط الصدر على الجهاز بدلًا منه.", "Ask your doctor; use the machine chest press instead."),
      HOLD_BREATH("الدفع", "the press"),
    ],
  },
  med_ball_chest_pass: {
    en: {
      setup: ["Stand two steps from a solid wall.", "Use a light ball (2–4 kg)."],
      steps: ["Push the ball from your chest to the wall.", "Catch it with soft arms and bring it back to your chest."],
      breathing: "Exhale as you push.", precautions: ["Light ball only, no jumping."], guideline: "2–3 sets × 10 reps",
    },
    start: bi("واقف قدام الحيطة، الكرة قدام الصدر.", "Facing the wall, ball at the chest."),
    posture: bi("ركبة مرتخية وظهر مفرود وبطن مشدودة.", "Soft knees, tall spine, braced core."),
    range: bi("فرد الدراعين بالكامل في الدفع والرجوع للصدر.", "Full arm extension on the push, back to the chest on the catch."),
    mistakes: [
      m("safety", "رمي بقوة كبيرة", "Throwing too hard", "الكرة ممكن ترتد بسرعة وتخبطك.", "The ball can rebound fast and hit you.", "دفعة متوسطة السرعة ومسافة ثابتة.", "Use a moderate push from a fixed distance."),
      m("posture", "لف الظهر", "Rounding the back", "بيحمّل أسفل الظهر.", "It loads the lower back.", "خلي صدرك مرفوع.", "Keep your chest up."),
      m("setup", "كرة تقيلة", "Ball too heavy", "بتشد الكتف والرسغ.", "It strains the shoulders and wrists.", "ابدأ بـ 2-3 كجم.", "Start with 2–3 kg."),
    ],
  },

  // ---------------- الظهر ----------------
  lat_pulldown: {
    en: {
      setup: ["Adjust the thigh pad so your legs are locked in.", "Grip the bar a little wider than shoulder width."],
      steps: ["Pull the bar to your upper chest while drawing the shoulder blades down.", "Keep the torso almost upright with a very slight lean.", "Return slowly until your arms are straight."],
      breathing: BREATH_EN, precautions: ["Never pull the bar behind your neck."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("قاعد والفخذ متثبت تحت الوسادة، والدراعين مفرودين على البار.", "Seated with thighs locked under the pad, arms straight on the bar."),
    posture: bi("صدر مرفوع وميلة لورا خفيفة جدًا، وكتف لتحت.", "Chest up with a very slight lean back, shoulders down."),
    range: bi("من دراع مفرود لحد ما البار يوصل أعلى الصدر.", "From straight arms until the bar reaches the upper chest."),
    mistakes: [
      m("safety", "السحب ورا الرقبة", "Pulling behind the neck", "بيحط الكتف في وضع خطر وبيشد الرقبة.", "It puts the shoulder in a risky position and strains the neck.", "اسحب دايمًا لقدام ناحية أعلى الصدر.", "Always pull in front, to the upper chest."),
      m("posture", "التأرجح لورا", "Swinging back", "الزخم بيعمل الشغل بدل الظهر وبيضغط على أسفل الظهر.", "Momentum does the work and loads the lower back.", "ثبّت جسمك وقلل الوزن.", "Stay still and reduce the weight."),
      m("tempo", "ترك البار يطلع بسرعة", "Letting the bar fly up", "بيشد الكتف فجأة.", "It yanks the shoulders.", "ارجع البار في 2-3 ثواني.", "Control the return over 2–3 seconds."),
      SHRUG,
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  seated_cable_row: {
    en: {
      setup: ["Sit with knees slightly bent and feet on the foot plates.", "Torso tall and upright."],
      steps: ["Pull the handle to your lower stomach while squeezing the shoulder blades.", "Return slowly without folding far forward."],
      breathing: BREATH_EN, precautions: ["If it bothers your back, use the chest-supported row machine."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("قاعد ورجليك على الدعامة والركبة مثنية شوية، والجذع معتدل.", "Seated, feet on the plates, knees soft, torso upright."),
    posture: bi("ظهر محايد وصدر مرفوع طول الحركة.", "Neutral spine and lifted chest throughout."),
    range: bi("اسحب لحد ما المقبض يلمس أسفل البطن، وارجع لحد ما الدراع يتفرد.", "Pull until the handle touches your lower belly; return to straight arms."),
    mistakes: [
      m("posture", "التأرجح بالجذع", "Rocking the torso", "الضهر بيعمل الشغل وبيتضغط.", "Your lower back takes over and gets stressed.", "ثبّت الجذع واتحرك بالدراعين ولوحي الكتف بس.", "Keep the torso still; move only arms and shoulder blades."),
      m("posture", "تدوير أسفل الظهر", "Rounding the lower back", "بيزود الضغط على الفقرات.", "It increases load on the spine.", "اقعد على عظمة الجلوس والصدر لفوق.", "Sit tall on your sit bones with chest up."),
      SHRUG,
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  machine_row: {
    en: {
      setup: ["Set the seat so the handles line up with the lower chest.", "Rest your chest on the pad."],
      steps: ["Pull the handles back while squeezing the shoulder blades.", "Pause briefly.", "Return slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("الصدر على الوسادة والمقابض على مستوى أسفل الصدر.", "Chest on the pad, handles at lower-chest level."),
    posture: bi("صدرك ملتصق بالوسادة طول الوقت.", "Chest stays glued to the pad."),
    range: bi("اسحب لحد ما الكوع يعدّي الجسم شوية.", "Pull until the elbows pass your torso slightly."),
    mistakes: [
      m("posture", "إبعاد الصدر عن الوسادة", "Lifting the chest off the pad", "بيلغي فايدة السند وبيحمّل الظهر.", "It cancels the support and loads the back.", "خلي الصدر على الوسادة وقلل الوزن.", "Keep your chest on the pad and lighten up."),
      SHRUG,
      m("setup", "مقعد عالي أو واطي", "Seat at the wrong height", "المقبض لو عالي بيشغّل الكتف بدل الظهر.", "High handles shift the work to the shoulders.", "خلي المقبض على مستوى أسفل الصدر.", "Set the handles at lower-chest level."),
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  assisted_pullup: {
    en: {
      setup: ["Choose enough assistance weight (more weight = easier).", "Some machines require kneeling on a pad."],
      steps: ["Pull yourself up until your chin nears the handles.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Kneeling on the pad may press on the knee; use the lat pulldown if it bothers you."], guideline: "2–3 sets × 6–10 reps",
    },
    start: bi("دراعين مفرودين على المقابض والجسم ساكن.", "Arms straight on the handles, body still."),
    posture: bi("بطن مشدودة وكتف لتحت.", "Core braced, shoulders down."),
    range: bi("من دراع مفرود لحد ما الدقن توصل للمقبض.", "From straight arms until the chin reaches the handles."),
    mistakes: [
      m("tempo", "التأرجح", "Swinging", "بيقلل شغل الظهر وبيعرّض الكتف للإصابة.", "It reduces back work and risks the shoulder.", "ثبّت جسمك وابدأ السحب من الكتف.", "Stay still and start the pull from the shoulders."),
      m("tempo", "النزول بسرعة", "Dropping down fast", "بيشد الكتف والكوع فجأة.", "It jerks the shoulders and elbows.", "انزل في 3 ثواني.", "Lower over 3 seconds."),
      m("safety", "الركوع على الوسادة مع ألم الركبة", "Kneeling on the pad with knee pain", "الضغط المباشر على الركبة بيزود الألم.", "Direct pressure on the knee increases pain.", "لو الركبة بتتضايق استخدم السحب العالي.", "If your knee complains, switch to the lat pulldown."),
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  one_arm_db_row: {
    en: {
      setup: ["Place one hand on the bench for support.", "Prefer standing with both feet on the floor instead of putting a knee on the bench if it bothers the knee."],
      steps: ["Keep your back flat and roughly parallel to the floor.", "Row the dumbbell toward your hip.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["If it bothers your back, use the chest-supported row."], guideline: "2–3 sets × 10–12 reps per side",
    },
    start: bi("إيد على البنش والظهر مفرود والدمبل متعلق تحت الكتف.", "One hand on the bench, flat back, dumbbell hanging under the shoulder."),
    posture: bi("ظهر محايد وكتفين على مستوى واحد من غير لف.", "Neutral spine, shoulders level, no twisting."),
    range: bi("اسحب لحد ما الدمبل يوصل جنب الورك.", "Row until the dumbbell reaches your hip."),
    mistakes: [
      m("posture", "لف الجذع لرفع الدمبل", "Twisting the torso to lift", "بيحمّل أسفل الظهر وبيقلل شغل الظهر.", "It loads the lower back and reduces lat work.", "خلي كتفك متوازيين مع الأرض.", "Keep both shoulders parallel to the floor."),
      m("posture", "تدوير الظهر", "Rounding the back", "بيزود الضغط على الفقرات.", "It increases spinal load.", "ادفع الصدر لقدام شوية وخلي ظهرك مفرود.", "Push your chest forward slightly and keep the back flat."),
      m("setup", "الركبة على البنش مع ألم الركبة", "Knee on the bench with knee pain", "الضغط على الركبة بيزود الألم.", "Pressure on the knee increases pain.", "قف برجليك الاتنين على الأرض.", "Stand with both feet on the floor."),
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  chest_supported_db_row: {
    en: {
      setup: ["Set the bench to 30–45°.", "Lie chest-down with feet on the floor."],
      steps: ["Row the dumbbells toward the sides of your stomach.", "Squeeze the shoulder blades.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Lying on the stomach can feel uncomfortable for some; adjust the angle or use the machine."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("صدرك على البنش المائل والدمبلز متعلقة لتحت.", "Chest on the incline bench, dumbbells hanging down."),
    posture: bi("رقبة محايدة وصدر ملتصق بالبنش.", "Neutral neck, chest stays on the bench."),
    range: bi("اسحب لحد ما الكوع يعدّي ظهرك شوية.", "Row until elbows pass your back slightly."),
    mistakes: [
      m("posture", "رفع الرأس بشدة", "Cranking the head up", "بيشد الرقبة.", "It strains the neck.", "بص لتحت قدامك بشوية.", "Look slightly ahead at the floor."),
      SHRUG,
      m("posture", "رفع الصدر من على البنش", "Lifting the chest off the bench", "بيلغي السند وبيحمّل أسفل الظهر.", "It cancels the support and loads the lower back.", "خلي الصدر على البنش وقلل الوزن.", "Keep your chest down and lighten the load."),
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  straight_arm_pulldown: {
    en: {
      setup: ["Set the pulley at the top with a bar or rope.", "Stand with a slight hip hinge and a straight back."],
      steps: ["Pull the bar toward your thighs keeping the arms nearly straight.", "Return slowly to head level."],
      breathing: BREATH_EN, precautions: ["Reduce the lean if you feel pressure in the lower back."], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("واقف بميلة خفيفة من الورك، الدراعين مفرودين لقدام.", "Slight hip hinge, arms extended forward."),
    posture: bi("ظهر مفرود وبطن مشدودة.", "Flat back, braced core."),
    range: bi("من مستوى الرأس لحد الفخذ.", "From head height down to the thighs."),
    mistakes: [
      m("range", "ثني الكوع بشدة", "Bending the elbows a lot", "التمرين بيتحول لترايسبس.", "It turns into a triceps movement.", "خلي الدراع شبه مفرود طول الحركة.", "Keep the arms almost straight."),
      m("posture", "تقويس الظهر", "Arching the back", "بيحمّل أسفل الظهر.", "It loads the lower back.", "شد البطن وقلل الميلة.", "Brace your abs and reduce the lean."),
      TOO_FAST,
      HOLD_BREATH("السحب", "the pull"),
    ],
  },
  back_extension_45: {
    en: {
      setup: ["Set the pad just below the hip bones."], steps: ["Hinge down from the hips with a straight back.", "Rise until the body is straight without over-arching."],
      breathing: BREATH_EN, precautions: ["Not added to the program automatically."], guideline: "As advised by a specialist",
      reviewRequired: "Needs a physiotherapist's review because of the intermittent back pain and the head-down position.",
    },
    start: bi("الوسادة تحت عظمة الحوض والجسم مستقيم.", "Pad below the hip bones, body straight."),
    posture: bi("ظهر محايد طول الوقت.", "Neutral spine throughout."),
    range: bi("لحد ما الجسم يبقى خط مستقيم بس، من غير تقوس زيادة.", "Only up to a straight line—no extra arch."),
    mistakes: [
      m("range", "التقوس لورا فوق", "Over-arching at the top", "بيضغط على فقرات أسفل الظهر.", "It compresses the lower spine.", "وقف لما جسمك يبقى مستقيم.", "Stop when your body is straight."),
      TOO_FAST,
      m("safety", "استخدامه مع ألم الظهر من غير تقييم", "Using it with back pain without assessment", "ممكن يزود الألم.", "It may aggravate the pain.", "استنى رأي أخصائي العلاج الطبيعي.", "Wait for a physiotherapist's advice."),
    ],
  },
  trx_row: {
    en: {
      setup: ["Hold the handles and lean back with a straight body.", "The more upright you stand, the easier it is."],
      steps: ["Pull your chest toward the handles.", "Lower back slowly until the arms are straight."],
      breathing: BREATH_EN, precautions: ["Start almost upright to keep the load low."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("ماسك المقابض ومايل لورا والجسم خط مستقيم.", "Holding the handles, leaning back in a straight line."),
    posture: bi("بطن ومؤخرة مشدودين.", "Abs and glutes tight."),
    range: bi("لحد ما الإيد توصل جنب الصدر.", "Until your hands reach the sides of your chest."),
    mistakes: [
      m("posture", "هبوط الحوض", "Hips sagging", "بيحمّل أسفل الظهر.", "It loads the lower back.", "شد المؤخرة والبطن.", "Squeeze glutes and abs."),
      SHRUG,
      m("setup", "ميلة كبيرة من أول مرة", "Leaning too far from the start", "الحمل بيبقى أكبر من قدرتك.", "The load is more than you can handle.", "ابدأ وانت شبه واقف وزود الميلة بالتدريج.", "Start nearly upright and lean further gradually."),
      HOLD_BREATH("السحب", "the pull"),
    ],
  },

  // ---------------- الكتف ----------------
  machine_shoulder_press: {
    en: {
      setup: ["Set the seat so the handles are at or slightly above shoulder height.", "Back against the pad."],
      steps: ["Press up until the arms are nearly straight.", "Lower slowly to a comfortable level."],
      breathing: BREATH_EN, precautions: ["Start light; overhead lifting requires good breathing control."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("المقابض على مستوى الكتف والظهر على المسند.", "Handles at shoulder height, back on the pad."),
    posture: bi("ظهر على المسند وبطن مشدودة.", "Back on the pad, core braced."),
    range: bi("من مستوى الكتف لحد ما الدراع يقرب يتفرد.", "From shoulder height to nearly straight arms."),
    mistakes: [
      m("posture", "تقويس أسفل الظهر", "Arching the lower back", "بيضغط على الفقرات.", "It compresses the spine.", "خلي ظهرك ملتصق بالمسند وقلل الوزن.", "Keep your back on the pad and lighten the load."),
      m("range", "نزول واطي جدًا", "Lowering too far", "بيضغط على مفصل الكتف.", "It stresses the shoulder joint.", "وقف عند مستوى الكتف تقريبًا.", "Stop at about shoulder height."),
      SHRUG,
      HOLD_BREATH("الدفع لفوق", "the overhead press"),
    ],
  },
  seated_db_shoulder_press: {
    en: {
      setup: ["Set the bench upright or at 75–80°.", "Back against the pad."],
      steps: ["Start with the dumbbells at shoulder level.", "Press up without clashing them.", "Lower slowly."],
      breathing: BREATH_EN, precautions: ["Don't hold your breath when pressing overhead."], guideline: "2–3 sets × 8–12 reps",
    },
    start: bi("الدمبلز على مستوى الكتف والكف لقدام.", "Dumbbells at shoulder height, palms forward."),
    posture: bi("ظهر على المسند ورأس محايد.", "Back on the pad, neutral head."),
    range: bi("من الكتف لحد فوق الرأس من غير قفل الكوع.", "From the shoulders to overhead without locking the elbows."),
    mistakes: [
      m("posture", "تقويس الظهر بعيد عن المسند", "Arching away from the pad", "بيضغط على أسفل الظهر.", "It loads the lower back.", "ثبّت ظهرك على المسند.", "Keep your back on the pad."),
      m("range", "الدفع لقدام بدل فوق", "Pressing forward instead of up", "بيحمّل مقدمة الكتف.", "It loads the front of the shoulder.", "ادفع لفوق في خط مستقيم.", "Press straight up."),
      TOO_HEAVY,
      HOLD_BREATH("الدفع لفوق", "the overhead press"),
    ],
  },
  db_lateral_raise: {
    en: {
      setup: ["Can be done seated on a bench to reduce swinging.", "Use a light weight."],
      steps: ["Raise the dumbbells out to the sides to about shoulder height with a slight elbow bend.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الدمبلز جنب الجسم والكوع مثني شوية.", "Dumbbells by your sides, elbows slightly bent."),
    posture: bi("واقف أو قاعد معتدل والكتف لتحت.", "Standing or seated tall, shoulders down."),
    range: bi("لحد مستوى الكتف بس.", "Up to shoulder height only."),
    mistakes: [
      m("range", "الرفع أعلى من الكتف كتير", "Raising well above shoulder height", "بيضغط على أعلى الكتف.", "It pinches the top of the shoulder.", "وقف عند مستوى الكتف.", "Stop at shoulder height."),
      m("tempo", "التأرجح بالجسم", "Swinging the body", "الزخم بيرفع الوزن بدل العضلة.", "Momentum lifts the weight instead of the muscle.", "اعمله جلوس وبوزن أخف.", "Do it seated with a lighter weight."),
      SHRUG,
      TOO_HEAVY,
    ],
  },
  cable_lateral_raise: {
    en: {
      setup: ["Pulley at the lowest point, stand side-on to the machine.", "Hold the machine with the other hand for balance."],
      steps: ["Raise the arm out to the side to shoulder height.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps per side",
    },
    start: bi("واقف جنب الجهاز والمقبض في الإيد البعيدة.", "Side-on to the machine, handle in the far hand."),
    posture: bi("جسم معتدل من غير ميل.", "Upright body without leaning."),
    range: bi("لحد مستوى الكتف.", "Up to shoulder height."),
    mistakes: [
      m("posture", "الميل بعيد عن الجهاز", "Leaning away from the machine", "بيغير زاوية الشد وبيحمّل الجنب.", "It changes the line of pull and loads the side.", "قف معتدل وامسك الجهاز.", "Stand tall and hold the machine."),
      SHRUG,
      TOO_FAST,
    ],
  },
  machine_lateral_raise: {
    en: {
      setup: ["Set the seat so the machine's pivot lines up with your shoulder joint."],
      steps: ["Raise the arms out to the sides to shoulder height.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("محور الجهاز بمحاذاة مفصل الكتف والوسادة على جنب الدراع.", "Machine pivot aligned with the shoulder, pads on the outer arms."),
    posture: bi("ظهر على المسند والكتف لتحت.", "Back on the pad, shoulders down."),
    range: bi("لحد مستوى الكتف.", "Up to shoulder height."),
    mistakes: [
      m("setup", "المحور مش على الكتف", "Pivot not aligned with the shoulder", "الحركة بتبقى غير طبيعية للمفصل.", "The movement becomes unnatural for the joint.", "ظبّط المقعد لحد ما المحور يبقى قدام مفصل الكتف.", "Adjust the seat until the pivot sits beside the shoulder joint."),
      TOO_FAST,
      SHRUG,
    ],
  },
  reverse_pec_deck: {
    en: {
      setup: ["Sit facing the pad.", "Set the handles so you start with arms in front of you."],
      steps: ["Open the arms back in an arc.", "Return slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("قاعد ووشك للمسند والدراعين قدامك.", "Seated facing the pad, arms in front."),
    posture: bi("صدر على المسند ورقبة محايدة.", "Chest on the pad, neutral neck."),
    range: bi("لحد ما الدراع يبقى على خط الجسم.", "Until the arms are in line with the body."),
    mistakes: [
      m("posture", "ضم لوحي الكتف بشدة بدل الكتف الخلفي", "Over-squeezing the shoulder blades", "الشغل بيروح لعضلات الظهر بدل الكتف الخلفي.", "Work shifts to the upper back instead of the rear delts.", "فكر إنك بتبعد الإيد لبره مش لورا.", "Think of pushing your hands out, not back."),
      TOO_FAST,
      TOO_HEAVY,
    ],
  },
  face_pull: {
    en: {
      setup: ["Pulley at face height with a rope.", "Stand steady one step back."],
      steps: ["Pull the rope toward your face while spreading the hands apart.", "Return slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الحبل على مستوى الوش والدراعين مفرودين.", "Rope at face height, arms extended."),
    posture: bi("جسم ثابت معتدل وبطن مشدودة.", "Still, upright body, braced core."),
    range: bi("لحد ما الإيد توصل جنب الودن.", "Until the hands reach beside your ears."),
    mistakes: [
      m("posture", "السحب بالجسم لورا", "Leaning back to pull", "الزخم بيعمل الشغل وبيحمّل الظهر.", "Momentum takes over and loads the back.", "قف ثابت وقلل الوزن.", "Stand still and lighten the weight."),
      TOO_HEAVY,
      SHRUG,
    ],
  },
  band_pull_apart: {
    en: {
      setup: ["Hold the band shoulder-width with arms in front at chest level."],
      steps: ["Pull the arms apart to the sides until the band nearly touches your chest.", "Return slowly."],
      breathing: "Exhale as you pull apart.", precautions: [], guideline: "2–3 sets × 12–15 reps",
    },
    start: bi("الحبل قدام الصدر والدراعين مفرودين.", "Band in front of the chest, arms straight."),
    posture: bi("صدر مرفوع وكتف لتحت.", "Chest up, shoulders down."),
    range: bi("لحد ما الحبل يقرب يلمس الصدر.", "Until the band almost touches your chest."),
    mistakes: [
      SHRUG,
      m("range", "ثني الكوع كتير", "Bending the elbows a lot", "بيقلل شغل الكتف الخلفي.", "It reduces rear-delt work.", "خلي الدراع شبه مفرود.", "Keep the arms nearly straight."),
      m("tempo", "ترك الحبل يرجع بسرعة", "Letting the band snap back", "بيضيع نص التمرين.", "You lose half the exercise.", "رجّعه ببطء.", "Return it slowly."),
    ],
  },

  // ---------------- البايسبس ----------------
  db_curl: {
    en: {
      setup: ["Sit on a bench with back support and a tall back."],
      steps: ["Bend the elbows to curl the dumbbells while keeping the elbows by your sides.", "Lower slowly until nearly straight."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("قاعد والدمبلز جنب الجسم والدراع مفرود.", "Seated, dumbbells at your sides, arms straight."),
    posture: bi("ظهر على المسند والكوع ثابت جنب الجسم.", "Back on the pad, elbows fixed at your sides."),
    range: bi("من دراع مفرود لحد ما الدمبل يقرب من الكتف.", "From straight arms until the dumbbell nears the shoulder."),
    mistakes: [
      m("posture", "تحريك الكوع لقدام", "Elbows drifting forward", "الكتف بيشيل جزء من الوزن.", "The shoulder takes part of the load.", "ثبّت الكوع جنب الجسم.", "Pin your elbows to your sides."),
      m("tempo", "التأرجح بالجسم", "Swinging the body", "الظهر بيرفع بدل البايسبس.", "The back lifts instead of the biceps.", "اقعد واسند ظهرك وقلل الوزن.", "Sit with back support and lighten up."),
      m("range", "نص حركة بس", "Half reps only", "العضلة مش بتشتغل على مداها.", "The muscle doesn't work through its range.", "افرد الدراع تقريبًا تحت.", "Nearly straighten the arm at the bottom."),
      HOLD_BREATH("الرفع", "the curl"),
    ],
  },
  cable_curl: {
    en: {
      setup: ["Pulley at the lowest point with a short bar.", "Stand close to the machine with soft knees."],
      steps: ["Bend the elbows to curl the bar.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("واقف قريب من الجهاز والبار قدام الفخذ.", "Standing close to the machine, bar at your thighs."),
    posture: bi("جذع ثابت وركبة مرتخية.", "Still torso, soft knees."),
    range: bi("لحد ما البار يقرب من الصدر.", "Until the bar nears your chest."),
    mistakes: [
      m("posture", "الميل لورا", "Leaning back", "بيحمّل أسفل الظهر.", "It loads the lower back.", "قف معتدل وقلل الوزن.", "Stand tall and lighten the load."),
      m("posture", "تحريك الكوع", "Moving the elbows", "الكتف بيشارك.", "The shoulders join in.", "خلي الكوع ثابت جنب الجسم.", "Keep elbows fixed at your sides."),
      TOO_FAST,
    ],
  },
  machine_preacher_curl: {
    en: {
      setup: ["Set the seat so your armpits rest on the edge of the pad."],
      steps: ["Bend the elbows.", "Lower slowly without snapping the elbows straight at the bottom."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("الإبط على حافة الوسادة والدراع مفرود شوية.", "Armpits on the pad edge, arms nearly straight."),
    posture: bi("صدر على الوسادة والكتف لتحت.", "Chest against the pad, shoulders down."),
    range: bi("من دراع شبه مفرود لحد فوق.", "From nearly straight arms to the top."),
    mistakes: [
      m("tempo", "النزول بسرعة في الآخر", "Dropping fast at the bottom", "بيشد وتر البايسبس والكوع.", "It strains the biceps tendon and elbow.", "انزل ببطء ووقف قبل الفرد الكامل.", "Lower slowly and stop short of full lockout."),
      m("setup", "مقعد واطي", "Seat too low", "الكتف بيرتفع والحركة بتبقى غلط.", "The shoulders hike up and the movement goes wrong.", "خلي الإبط على حافة الوسادة.", "Rest your armpits on the pad edge."),
      TOO_HEAVY,
    ],
  },
  hammer_curl: {
    en: {
      setup: ["Neutral grip (thumbs up). Can be done seated."],
      steps: ["Bend the elbow.", "Lower slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("الدمبلز جنب الجسم والإبهام لفوق.", "Dumbbells at your sides, thumbs up."),
    posture: bi("معتدل والكوع ثابت.", "Tall posture, elbows fixed."),
    range: bi("لحد ما الدمبل يقرب من الكتف.", "Until the dumbbell nears the shoulder."),
    mistakes: [
      m("tempo", "التأرجح", "Swinging", "الظهر بيشارك.", "The back gets involved.", "اعمله جلوس وبوزن أخف.", "Do it seated and lighter."),
      m("posture", "لف الرسغ", "Twisting the wrist", "بيغير العضلة المستهدفة.", "It changes the target muscle.", "خلي الإبهام لفوق طول الحركة.", "Keep the thumb up throughout."),
      HOLD_BREATH("الرفع", "the curl"),
    ],
  },
  ez_bar_curl: {
    en: {
      setup: ["Hold the angled part of the bar with a wrist-friendly grip.", "Stand steady with soft knees."],
      steps: ["Curl the bar while keeping the elbows by your sides.", "Lower slowly until almost straight."],
      breathing: "Exhale as you curl and inhale as you lower.", precautions: ["If your back is tired, do seated dumbbell curls instead."], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("البار قدام الفخذ والقبضة على الجزء المائل.", "Bar at your thighs, grip on the angled section."),
    posture: bi("جذع ثابت ومعتدل.", "Still, upright torso."),
    range: bi("لحد ما البار يقرب من الصدر.", "Until the bar nears your chest."),
    mistakes: [
      m("posture", "الميل لورا", "Leaning back to lift", "بيحمّل أسفل الظهر.", "It loads the lower back.", "قلل الوزن وثبّت جسمك.", "Lighten the bar and stay still."),
      m("posture", "تحريك الكوع لقدام", "Elbows drifting forward", "الكتف بيشيل الوزن.", "The shoulders take the load.", "ثبّت الكوع جنب الجسم.", "Pin the elbows to your sides."),
      HOLD_BREATH("الرفع", "the curl"),
    ],
  },

  // ---------------- الترايسبس ----------------
  cable_pushdown: {
    en: {
      setup: ["Pulley at the top with a rope or bar.", "Elbows by your sides."],
      steps: ["Straighten the elbows downward.", "Return slowly to about 90°."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الكوع جنب الجسم بزاوية 90 والحبل قدام الصدر.", "Elbows at your sides at 90°, rope in front of the chest."),
    posture: bi("معتدل وميلة خفيفة جدًا لقدام.", "Upright with a very slight forward lean."),
    range: bi("من زاوية 90 لحد فرد الكوع.", "From 90° to full elbow extension."),
    mistakes: [
      m("posture", "تحريك الكوع لقدام ولورا", "Elbows moving back and forth", "الكتف بيشارك والترايسبس بيشتغل أقل.", "The shoulder joins in and triceps work less.", "ثبّت الكوع جنب الجسم.", "Pin your elbows to your sides."),
      m("posture", "الانحناء بالجسم على الوزن", "Leaning over the weight", "الجسم بيدفع بدل الدراع.", "Your bodyweight pushes instead of the arms.", "قف معتدل وقلل الوزن.", "Stand tall and lighten the load."),
      TOO_FAST,
    ],
  },
  overhead_cable_ext: {
    en: {
      setup: ["Pulley low or mid with a rope.", "Split stance with a braced trunk."],
      steps: ["Straighten the elbows forward and up.", "Return slowly."],
      breathing: BREATH_EN, precautions: ["If it bothers your back, use the pushdown."], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الحبل ورا الرأس والكوع لقدام.", "Rope behind the head, elbows forward."),
    posture: bi("بطن مشدودة وظهر محايد.", "Braced core, neutral back."),
    range: bi("لحد ما الدراع يتفرد فوق الرأس.", "Until the arms straighten overhead."),
    mistakes: [
      m("posture", "تقويس الظهر", "Arching the back", "بيحمّل أسفل الظهر.", "It loads the lower back.", "شد البطن وخطوة لقدام.", "Brace your core and stagger your stance."),
      m("posture", "فتح الكوع كتير", "Flaring the elbows", "بيحمّل الكتف.", "It loads the shoulder.", "خلي الكوع قريب من الرأس.", "Keep elbows close to your head."),
      TOO_HEAVY,
    ],
  },
  triceps_machine: {
    en: {
      setup: ["Set the seat so the elbow lines up with the machine's pivot."],
      steps: ["Straighten the elbows.", "Return slowly."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–15 reps",
    },
    start: bi("الكوع على الوسادة بمحاذاة محور الجهاز.", "Elbows on the pad, aligned with the pivot."),
    posture: bi("ظهر على المسند والكتف لتحت.", "Back on the pad, shoulders down."),
    range: bi("من 90 درجة لحد فرد الكوع.", "From 90° to elbow extension."),
    mistakes: [
      SHRUG,
      m("setup", "الكوع مش على المحور", "Elbow not aligned with the pivot", "بيضغط على مفصل الكوع.", "It stresses the elbow joint.", "ظبّط المقعد.", "Adjust the seat."),
      TOO_FAST,
    ],
  },
  db_overhead_ext: {
    en: {
      setup: ["Sit on an upright bench.", "Hold one dumbbell with both hands."],
      steps: ["Lower the dumbbell behind your head slowly.", "Straighten the elbows upward."],
      breathing: BREATH_EN, precautions: [], guideline: "2–3 sets × 10–12 reps",
    },
    start: bi("قاعد والدمبل فوق الرأس بالإيدين.", "Seated, dumbbell overhead in both hands."),
    posture: bi("ظهر على المسند والكوع ناحية السقف.", "Back on the pad, elbows pointing up."),
    range: bi("نزول مريح ورا الرأس والرجوع لفوق.", "A comfortable lower behind the head and back up."),
    mistakes: [
      m("posture", "تقويس الظهر", "Arching the back", "بيضغط على أسفل الظهر.", "It loads the lower back.", "ثبّت ظهرك على المسند.", "Keep your back on the pad."),
      TOO_HEAVY,
      m("range", "نزول عميق جدًا", "Lowering too deep", "بيشد الكوع.", "It strains the elbow.", "انزل لحد ما تحس بشد خفيف بس.", "Lower only to a light stretch."),
    ],
  },
};
