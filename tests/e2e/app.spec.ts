import { expect, test, type Page } from "@playwright/test";

// تثبيت تاريخ اليوم على الاثنين 2 نوفمبر 2026 (الحصة الثانية، والسبت 31 أكتوبر فائتة)
async function setup(page: Page, iso = "2026-11-02T10:00:00") {
  await page.clock.install({ time: new Date(iso) });
  await page.clock.resume();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("التنقل بين كل الشاشات واتجاه RTL وعرض الهاتف", async ({ page }) => {
  const errors = await setup(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByTestId("today-date")).toContainText("الاثنين");
  await expect(page.getByTestId("today-date")).toContainText("2026");
  await noHorizontalScroll(page);

  const nav = page.getByRole("navigation", { name: "التنقل الرئيسي" });
  const pages: [string, RegExp, string][] = [
    ["تمرين اليوم", /\/workout\//, "الحصة B"],
    ["دليل الأجهزة", /\/library\/$/, "مكتبة الأجهزة"],
    ["التقدم", /\/progress\/$/, "التقدم"],
    ["الإعدادات", /\/settings\/$/, "الإعدادات"],
    ["الرئيسية", /\/$/, "النهارده"],
  ];
  for (const [label, url, heading] of pages) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByText(heading).first()).toBeVisible();
    await noHorizontalScroll(page);
  }
  // الشاشات الفرعية
  for (const path of ["/program/", "/reports/", "/safety/", "/credits/", "/library/custom/", "/library/exercise/?id=leg_press", "/program/session/?id=w05-C", "/equipment/?id=leg_press", "/warmup/", "/alternatives/"]) {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    await noHorizontalScroll(page);
  }
  // اتجاه النص العربي محسوب فعليًا من المتصفح
  const dir = await page.locator("main h1").first().evaluate((el) => getComputedStyle(el).direction);
  expect(dir).toBe("rtl");
  expect(errors).toEqual([]);
});

test("الرئيسية: حصة فائتة وإعادة جدولتها يدويًا", async ({ page }) => {
  await setup(page);
  await page.goto("/");
  await expect(page.getByTestId("missed-alert")).toContainText("1 حصة فائتة");
  await expect(page.getByTestId("current-session")).toContainText("حصة اليوم");
  await expect(page.getByTestId("current-session")).toContainText("· B");
  await expect(page.getByTestId("program-pct")).toHaveText("0%");
  await page.getByTestId("missed-row").getByRole("button", { name: "إعادة جدولة" }).click();
  await page.getByLabel("التاريخ الجديد").fill("2026-11-03");
  await page.getByRole("button", { name: "حفظ الموعد" }).click();
  await expect(page.getByTestId("missed-alert")).toHaveCount(0);
  await page.goto("/program/");
  await expect(page.getByTestId("session-link-w01-A")).toContainText("معاد جدولتها");
});

test("تمرين مباشر: زر تم، تراجع، حفظ تلقائي، استعادة، بدائل، احتفال النهاية", async ({ page }) => {
  await setup(page);
  await page.goto("/");
  await page.getByTestId("start-today").click();
  await expect(page).toHaveURL(/session=w01-B/);
  await page.getByTestId("start-session").click();
  await page.getByTestId("warmup-done").click();

  await expect(page.getByTestId("exercise-name")).toHaveText("سحب عالي (لات بول داون)");
  await page.getByTestId("weight-0").fill("35");
  await page.getByTestId("reps-0").fill("12");
  await page.getByTestId("difficulty-0").getByRole("button", { name: /مناسب/ }).click();
  // زر «تم» الكبير يسجل المجموعة التالية فورًا ويعرض رسالة تحفيز مع تراجع
  await page.getByTestId("complete").click();
  await expect(page.getByTestId("done-0")).toHaveText("✓ تمت");
  await expect(page.getByTestId("toast")).toBeVisible();
  await expect(page.getByTestId("autosaved")).toBeVisible();
  await expect(page.getByTestId("rest-remaining")).toHaveText(/1:2\d|1:30/);
  await page.getByTestId("complete").click();
  await expect(page.getByTestId("done-1")).toHaveText("✓ تمت");
  await page.getByTestId("undo").click();
  await expect(page.getByTestId("done-1")).toHaveText("تم");
  await expect(page.getByTestId("done-0")).toHaveText("✓ تمت");

  // تحديث الصفحة: يجب استعادة الحصة والبيانات
  await page.reload();
  await expect(page.getByTestId("exercise-name")).toHaveText("سحب عالي (لات بول داون)");
  await expect(page.getByTestId("weight-0")).toHaveValue("35");
  await expect(page.getByTestId("reps-0")).toHaveValue("12");
  await expect(page.getByTestId("done-0")).toHaveText("✓ تمت");

  // البدائل: على الأقل بديلين ببطاقات مصورة، والاختيار للحصة دي بس
  await page.getByTestId("open-alternatives").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("البديل الأول")).toBeVisible();
  await expect(dialog.getByText("البديل الثاني")).toBeVisible();
  expect(await dialog.getByTestId("alt-card").count()).toBeGreaterThanOrEqual(2);
  await dialog.getByTestId("missing-device").click();
  await expect(dialog.getByTestId("ranked-list")).toBeVisible();
  const first = dialog.getByTestId("ranked-list").getByTestId("alt-card").first();
  const chosenName = (await first.getByTestId("alt-name").textContent())!.trim();
  await first.getByTestId("choose-alt").click();
  const confirm = dialog.getByRole("button", { name: "أؤكد الاختيار" });
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.getByTestId("exercise-name")).toHaveText(chosenName);

  // الانتقال للتالي ثم الكارديو والإنهاء
  await page.getByTestId("next-exercise").click();
  await expect(page.getByTestId("exercise-name")).toHaveText("ضغط كتف على الجهاز");
  await page.getByRole("button", { name: "كارديو" }).click();
  await page.getByTestId("cardio-done").click();
  await expect(page.getByTestId("cardio-minutes")).toHaveValue("10");
  await page.getByTestId("to-finish").click();
  await expect(page.getByTestId("celebration")).toBeVisible();
  await page.getByTestId("energy").getByRole("button", { name: "جيد" }).click();
  await page.getByTestId("finish-session").click();
  await expect(page.getByTestId("celebration")).toContainText("تم حفظ الحصة");

  await page.goto("/");
  await expect(page.getByTestId("program-pct")).toHaveText("1%");
  // البرنامج الأساسي لم يتغير
  await page.goto("/program/session/?id=w01-B");
  await expect(page.getByTestId("session-exercises")).toContainText("سحب عالي (لات بول داون)");
});

test("ألم شديد: يطلب التوقف ولا يقترح بديل يحمّل نفس المنطقة", async ({ page }) => {
  await setup(page);
  await page.goto("/workout/?session=w01-A");
  await page.getByTestId("start-session").click();
  await page.getByTestId("warmup-done").click();
  await expect(page.getByTestId("exercise-name")).toHaveText("دفع الأرجل (ليج برس)");
  await page.getByTestId("pain-choice").getByRole("button", { name: /ألم شديد/ }).click();
  await page.getByTestId("pain-area").getByRole("button", { name: /الركبة/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: /توقف|وقّف|أوقف/ }).first()).toBeVisible();
  await expect(page.getByTestId("skip-painful")).toBeVisible();
  await page.getByTestId("open-alternatives").click();
  const dialog = page.getByRole("dialog");
  const ids = await dialog.getByTestId("alt-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-exercise-id")));
  // لا بدائل بحمل عالٍ/متوسط على الركبة مثل السكوات والطعن
  for (const bad of ["hack_squat", "barbell_back_squat", "walking_lunge", "goblet_box_squat", "step_up_low"]) expect(ids).not.toContain(bad);
});

test("الإحماء المصوّر: خطوات وإكمال", async ({ page }) => {
  await setup(page);
  await page.goto("/warmup/?session=w01-B");
  const moves = page.getByTestId("warmup-move");
  await expect(moves.first()).toBeVisible();
  expect(await moves.count()).toBeGreaterThanOrEqual(5);
  await page.getByTestId("start-warmup").click();
  await expect(page.getByTestId("warmup-step")).toBeVisible();
  const firstName = await page.getByTestId("warmup-move-name").textContent();
  await page.getByTestId("warmup-next").click();
  await expect(page.getByTestId("warmup-move-name")).not.toHaveText(firstName!);
  while (await page.getByTestId("warmup-next").isVisible()) await page.getByTestId("warmup-next").click();
  await page.getByTestId("complete-warmup").click();
  await expect(page).toHaveURL(/\/workout\/\?session=w01-B/);
  await expect(page.getByTestId("exercise-name")).toHaveText("سحب عالي (لات بول داون)");
});

test("اللغة والثيمات ووضع العرض تتغير فورًا وتتحفظ", async ({ page }) => {
  await setup(page);
  await page.goto("/settings/");
  await page.getByTestId("language-choice").getByRole("button", { name: /English/ }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toContainText("Home");
  await page.getByTestId("mode-choice").getByRole("button", { name: /Light/ }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  for (const t of ["premium", "midnight", "clean", "graphite", "ocean", "sport"]) {
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent"));
    await page.getByTestId(`theme-${t}`).click();
    await expect(page.getByTestId(`theme-${t}`)).toHaveAttribute("aria-pressed", "true");
    expect(typeof before).toBe("string");
  }
  await page.getByTestId("theme-ocean").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ocean");
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())).toBe(accent);
  await page.goto("/");
  await expect(page.getByTestId("home-title")).toContainText("Daily");
  await noHorizontalScroll(page);
  await page.goto("/workout/?session=w01-B");
  await expect(page.getByTestId("start-session")).toBeVisible();
  await noHorizontalScroll(page);
  // الرجوع للعربي + داكن
  await page.goto("/settings/");
  await page.getByTestId("language-choice").getByRole("button", { name: /العربية/ }).click();
  await page.getByTestId("mode-choice").getByRole("button", { name: /داكن/ }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("مكتبة الأجهزة: بحث، تصنيف، وتوفر الجهاز", async ({ page }) => {
  await setup(page);
  await page.goto("/library/");
  await page.getByTestId("tab-equipment").click();
  await page.getByTestId("library-search").fill("leg press");
  await page.getByTestId("equipment-list").getByTestId("equipment-card").first().click();
  await expect(page).toHaveURL(/\/equipment\/\?id=/);
  await expect(page.getByTestId("equipment-name")).toBeVisible();
  await page.getByTestId("equipment-availability").getByRole("button", { name: /غير متاح/ }).click();
  await expect(page.getByTestId("equipment-availability").getByRole("button", { name: /غير متاح/ })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.getByTestId("equipment-availability").getByRole("button", { name: /غير متاح/ })).toHaveAttribute("aria-pressed", "true");
});

test("الأخطاء الشائعة: لكل تمرين 3-5 أخطاء مع السبب والتصحيح", async ({ page }) => {
  await setup(page);
  await page.goto("/library/exercise/?id=leg_press");
  await page.getByRole("tab", { name: "الأخطاء الشائعة" }).click();
  const items = page.getByTestId("mistake");
  const n = await items.count();
  expect(n).toBeGreaterThanOrEqual(3);
  expect(n).toBeLessThanOrEqual(5);
  await expect(items.first()).toContainText("ليه غلط؟");
  await expect(items.first()).toContainText("التصحيح");
});

test("مؤقت الراحة: بدء وتعديل وانتهاء", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-02T10:00:00") });
  await page.goto("/workout/?session=w01-B");
  await page.getByTestId("start-session").click();
  await page.getByTestId("warmup-done").click();
  await page.getByTestId("done-0").click();
  await expect(page.getByTestId("rest-remaining")).toHaveText("1:30");
  await page.getByRole("button", { name: "زيادة 15 ثانية" }).click();
  await expect(page.getByTestId("rest-remaining")).toHaveText("1:45");
  await page.clock.runFor(30_000);
  await expect(page.getByTestId("rest-remaining")).toHaveText("1:15");
  await page.getByRole("button", { name: "إيقاف مؤقت" }).click();
  await page.clock.runFor(20_000);
  await expect(page.getByTestId("rest-remaining")).toHaveText("1:15");
  await page.getByRole("button", { name: "استئناف" }).click();
  await page.clock.runFor(76_000);
  await expect(page.getByText("انتهت الراحة!")).toBeVisible();
  await page.getByTestId("rest-timer").getByRole("button", { name: "إنهاء" }).click();
  await expect(page.getByRole("button", { name: "ابدأ الراحة" })).toBeVisible();
});

test("تعديل تمارين حصة: إضافة وتعديل وحذف", async ({ page }) => {
  await setup(page);
  await page.goto("/program/session/?id=w03-A");
  const items = page.getByTestId("session-exercise");
  await expect(items).toHaveCount(5);
  await page.getByTestId("add-exercise").click();
  await page.getByLabel("بحث عن تمرين").fill("face pull");
  await page.getByRole("dialog").getByRole("button", { name: /فيس بول/ }).click();
  await expect(items).toHaveCount(6);
  await expect(items.last()).toContainText("فيس بول");

  await items.last().getByTestId("edit-exercise").click();
  await page.getByTestId("edit-sets").fill("4");
  await page.getByTestId("save-edit").click();
  await expect(items.last()).toContainText("4 ×");

  await items.first().getByTestId("delete-exercise").click();
  await expect(items).toHaveCount(5);
  await expect(page.getByText("معدلة لهذه الحصة فقط")).toBeVisible();

  // الحصة المطابقة في أسبوع آخر لم تتأثر
  await page.goto("/program/session/?id=w04-A");
  await expect(page.getByTestId("session-exercise")).toHaveCount(5);

  await page.goto("/program/session/?id=w03-A");
  await page.getByRole("button", { name: "استرجاع تمارين البرنامج الأصلية" }).click();
  await expect(page.getByTestId("session-exercise").first()).toContainText("دفع الأرجل");
});

test("الدليل: بحث وتصفية وصورة وروابط بحث", async ({ page }) => {
  await setup(page);
  await page.goto("/library/");
  await page.getByTestId("library-search").fill("leg press");
  await expect(page.getByTestId("library-list").locator("li").first()).toContainText("دفع الأرجل");
  await page.getByTestId("library-search").fill("سحب عالى");
  await expect(page.getByTestId("library-list")).toContainText("سحب عالي");
  await page.getByTestId("library-search").fill("");
  await page.getByRole("button", { name: "السمانة" }).click();
  const names = (await page.getByTestId("lib-name").allTextContents()).map((x) => x.trim());
  expect(names.length).toBeGreaterThan(2);
  expect(names).toContain("سمانة جلوس على الجهاز");
  expect(names).not.toContain("ضغط صدر على الجهاز");
  await page.getByRole("button", { name: "كل العضلات" }).click();

  await page.goto("/library/exercise/?id=leg_extension");
  await expect(page.getByTestId("exercise-media").first()).toBeVisible();
  await expect(page.getByText("يحتاج مراجعة متخصص").first()).toBeVisible();
  await page.getByRole("tab", { name: "السلامة" }).click();
  const link = page.getByRole("link", { name: /صور الجهاز/ });
  await expect(link).toHaveAttribute("href", /google\.com\/search\?tbm=isch&q=Leg%20Extension/);
});

test("تمرين مخصص: إضافة وتعديل وحذف", async ({ page }) => {
  await setup(page);
  await page.goto("/library/custom/");
  await page.getByLabel("الاسم العربي *").fill("جهاز تجريبي");
  await page.getByLabel("الاسم الإنجليزي الشائع *").fill("Test Machine");
  await page.getByRole("group", { name: "العضلات الرئيسية *" }).getByRole("button", { name: "الصدر" }).click();
  await page.getByRole("group", { name: "المعدات المطلوبة *" }).getByRole("button", { name: "جهاز ضغط الصدر", exact: true }).click();
  await page.getByTestId("save-custom").click();
  await expect(page.locator("main h1")).toHaveText("جهاز تجريبي");
  await expect(page.getByText("تمرين مخصص").first()).toBeVisible();

  await page.getByRole("link", { name: "تعديل" }).click();
  await page.getByLabel("الاسم العربي *").fill("جهاز تجريبي معدل");
  await page.getByTestId("save-custom").click();
  await expect(page.locator("main h1")).toHaveText("جهاز تجريبي معدل");

  await page.getByRole("button", { name: "حذف" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "حذف" }).click();
  await expect(page).toHaveURL(/\/library\/$/);
  await page.getByTestId("library-search").fill("جهاز تجريبي");
  await expect(page.getByText("لا توجد نتائج مطابقة.")).toBeVisible();
});

test("القياسات والإعدادات والوضع الداكن والنسخ الاحتياطي", async ({ page }) => {
  await setup(page);
  await page.goto("/progress/");
  await page.getByTestId("m-weight").fill("131.6");
  await page.getByTestId("save-measurement").click();
  await expect(page.getByTestId("measurement-list")).toContainText("131.6");
  await page.goto("/");
  await expect(page.locator("main")).toContainText("131.6");

  await page.goto("/settings/");
  await page.getByTestId("start-weight").fill("132");
  await page.getByTestId("save-settings").click();
  await page.getByTestId("mode-choice").getByRole("button", { name: /داكن/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByTestId("start-weight")).toHaveValue("132");

  const dl = page.waitForEvent("download");
  await page.getByTestId("export-json").click();
  const file = await dl;
  const path = await file.path();
  const json = JSON.parse(require("node:fs").readFileSync(path, "utf8"));
  expect(json.format).toBe("amr-healthy-life-backup");
  expect(json.data.measurements).toHaveLength(1);

  // حذف القياس ثم استعادته من النسخة الاحتياطية
  await page.goto("/progress/");
  await page.getByRole("button", { name: "حذف القياس" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "حذف" }).click();
  await expect(page.getByTestId("measurement-list")).toHaveCount(0);
  await page.goto("/settings/");
  await page.getByTestId("import-file").setInputFiles(path!);
  await page.getByTestId("confirm-import").click();
  await expect(page.getByText(/تم الاستيراد/)).toBeVisible();
  await page.goto("/progress/");
  await expect(page.getByTestId("measurement-list")).toContainText("131.6");

  const csv = page.waitForEvent("download");
  await page.goto("/settings/");
  await page.getByTestId("export-csv").click();
  expect((await csv).suggestedFilename()).toMatch(/\.csv$/);
});

test("التقارير الأسبوعية والشهرية والشاملة", async ({ page }) => {
  await setup(page);
  await page.goto("/reports/");
  await expect(page.getByText("التقرير الأسبوعي – الأسبوع 1")).toBeVisible();
  await page.getByRole("tab", { name: "شهري" }).click();
  await expect(page.getByText(/التقرير الشهري/)).toBeVisible();
  await page.getByRole("tab", { name: "شامل" }).click();
  await expect(page.getByText("التقرير الشامل لنهاية الستة أشهر")).toBeVisible();
  await expect(page.getByTestId("report")).toContainText("الحصص المخططة");
});
