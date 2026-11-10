// All user-facing strings. The app is Arabic-only for now; keeping strings in
// one dictionary means English can be added later without touching screens.
export const ar = {
  appName: 'مركز ذكاء الأنظمة الكهروميكانيكية',
  appShortName: 'MEP Hub',

  tabs: {
    home: 'الرئيسية',
    feed: 'الموجز',
    library: 'المكتبة',
    settings: 'الإعدادات',
  },

  common: {
    loading: 'جارٍ التحميل…',
    retry: 'إعادة المحاولة',
    save: 'حفظ',
    saved: 'تم الحفظ',
    cancel: 'إلغاء',
    errorGeneric: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
    errorNetwork: 'تعذّر الاتصال بالخادم. تأكد من الإنترنت ثم أعد المحاولة.',
    recommendationOnly:
      'هذه توصية فقط. القرار الهندسي والاعتماد النهائي مسؤولية المهندس المختص.',
  },

  config: {
    title: 'الإعدادات غير مكتملة',
    body:
      'لم يتم ضبط عناوين الخادم وقاعدة البيانات في هذه النسخة من التطبيق. يرجى إضافة القيم المطلوبة في ملف ‎.env‎ ثم إعادة البناء.',
  },

  auth: {
    title: 'تسجيل الدخول',
    subtitle: 'منصة ذكاء هندسي للتكييف والكهرباء والصحي والحريق',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@company.com',
    sendCode: 'إرسال رمز الدخول',
    codeSent: 'أرسلنا رمزًا مكونًا من 6 أرقام إلى بريدك.',
    codeLabel: 'رمز الدخول',
    verify: 'تأكيد الدخول',
    changeEmail: 'تغيير البريد الإلكتروني',
    invalidEmail: 'اكتب بريدًا إلكترونيًا صحيحًا.',
    invalidCode: 'الرمز غير صحيح أو انتهت صلاحيته.',
    signOut: 'تسجيل الخروج',
  },

  home: {
    greeting: 'أهلًا بك',
    noOrgTitle: 'أنشئ مؤسستك أولًا',
    noOrgBody:
      'تُحفظ المشروعات والأسعار وعروض الموردين داخل مؤسسة منفصلة لا يراها غيرك.',
    orgNameLabel: 'اسم المؤسسة أو الشركة',
    createOrg: 'إنشاء المؤسسة',
    currentOrg: 'المؤسسة الحالية',
    topOpportunities: 'أفضل الفرص الهندسية',
    newStandards: 'تحديثات الكودات والمواصفات',
    costThisMonth: 'تكلفة التشغيل هذا الشهر',
    emptyPipeline:
      'لم يبدأ جمع المصادر بعد. سيتم تفعيل الرصد الآلي في المرحلة الثانية — لا توجد بيانات معروضة حتى الآن.',
  },

  feed: {
    title: 'موجز الذكاء الهندسي',
    empty:
      'لا توجد اكتشافات بعد. بعد تفعيل سجل المصادر ستظهر هنا الأخبار والمنتجات مع رابط المصدر الأصلي وتاريخ النشر ودرجة الثقة.',
  },

  library: {
    title: 'المكتبة المحفوظة',
    empty: 'لم تحفظ أي عنصر بعد. ستتوفر العناصر المحفوظة دون اتصال بالإنترنت.',
  },

  settings: {
    title: 'الإعدادات والتحكم في التكلفة',
    account: 'الحساب',
    markets: 'الأسواق المتابَعة',
    marketNames: { EG: 'مصر', GCC: 'دول الخليج', GLOBAL: 'عالمي' },
    notifications: 'فئات الإشعارات',
    categoryNames: {
      critical_opportunity: 'فرص هندسية حرجة',
      high_value_product: 'منتجات عالية القيمة',
      cost_saving: 'اكتشافات توفير التكلفة',
      energy_efficiency: 'ابتكارات كفاءة الطاقة',
      market_change: 'تغيرات السوق',
      standards_update: 'تحديثات الكودات',
      new_supplier: 'موردون جدد',
    },
    budget: 'الميزانية الشهرية',
    monthlyLimit: 'الحد الشهري (دولار)',
    alertAt: 'تنبيه عند',
    hardStop: 'إيقاف المهام غير الأساسية عند بلوغ الحد',
    adminOnly: 'تعديل الميزانية متاح لمالك المؤسسة أو المسؤول فقط.',
    usage: 'الاستهلاك',
    actual: 'فعلي',
    estimated: 'تقديري',
    noUsage: 'لا يوجد استهلاك مسجل هذا الشهر.',
    status: { ok: 'ضمن الميزانية', alert: 'اقترب من الحد', limit_reached: 'تم بلوغ الحد' },
    atLeastOneMarket: 'اختر سوقًا واحدًا على الأقل.',
  },

  roles: { owner: 'مالك', admin: 'مسؤول', engineer: 'مهندس', viewer: 'مشاهد' },
} as const;

export type MarketCode = keyof typeof ar.settings.marketNames;
export type CategoryCode = keyof typeof ar.settings.categoryNames;
export type RoleCode = keyof typeof ar.roles;
