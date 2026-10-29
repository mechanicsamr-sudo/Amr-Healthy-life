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
    ["تمرين اليوم", /\/workout\/$/, "تمرين اليوم"],
    ["دليل الأجهزة", /\/library\/$/, "دليل العضلات والأجهزة"],
    ["التقدم", /\/progress\/$/, "متابعة التقدم"],
    ["الإعدادات", /\/settings\/$/, "الإعدادات"],
    ["الرئيسية", /\/$/, "اليوم"],
  ];
  for (const [label, url, heading] of pages) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByText(heading).first()).toBeVisible();
    await noHorizontalScroll(page);
  }
  // الشاشات الفرعية
  for (const path of ["/program/", "/reports/", "/safety/", "/library/custom/", "/library/exercise/?id=leg_press", "/program/session/?id=w05-C"]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    await noHorizontalScroll(page);
  }
  // اتجاه النص العربي محسوب فعليًا من المتصفح
  const dir = await page.locator("main h1").evaluate((el) => getComputedStyle(el).direction);
  expect(dir).toBe("rtl");
  expect(errors).toEqual([]);
});

test("الرئيسية: حصة فائتة وإعادة جدولتها يدويًا", async ({ page }) => {
  await setup(page);
  await page.goto("/");
  await expect(page.getByTestId("missed-alert")).toContainText("1 حصة فائتة");
  await expect(page.getByTestId("current-session")).toContainText("حصة اليوم");
  await expect(page.getByTestId("current-session")).toContainText("الحصة B");
  await expect(page.getByTestId("program-pct")).toHaveText("0%");
  await page.getByTestId("missed-row").getByRole("button", { name: "إعادة جدولة" }).click();
  await page.getByLabel("التاريخ الجديد").fill("2026-11-03");
  await page.getByRole("button", { name: "حفظ الموعد" }).click();
  await expect(page.getByTestId("missed-alert")).toHaveCount(0);
  await page.goto("/program/");
  await expect(page.getByTestId("session-link-w01-A")).toContainText("معاد جدولتها");
});

test("تمرين مباشر: تسجيل، حفظ تلقائي، استعادة بعد التحديث، بدائل، إنهاء", async ({ page }) => {
  await setup(page);
  await page.goto("/");
  await page.getByTestId("start-today").click();
  await expect(page).toHaveURL(/session=w01-B/);
  await page.getByTestId("start-session").click();
  await page.getByTestId("warmup-done").click();

  await expect(page.getByTestId("exercise-name")).toHaveText("سحب عالي (لات بول داون)");
  await page.getByTestId("weight-0").fill("35");
  await page.getByTestId("reps-0").fill("12");
  await page.getByLabel("مستوى المجهود (RPE)").first().selectOption("6");
  await page.getByTestId("done-0").click();
  await expect(page.getByTestId("autosaved")).toBeVisible();
  await expect(page.getByTestId("rest-remaining")).toHaveText(/1:2\d|1:30/);

  // تحديث الصفحة: يجب استعادة الحصة والبيانات
  await page.reload();
  await expect(page.getByTestId("exercise-name")).toHaveText("سحب عالي (لات بول داون)");
  await expect(page.getByTestId("weight-0")).toHaveValue("35");
  await expect(page.getByTestId("reps-0")).toHaveValue("12");
  await expect(page.getByTestId("done-0")).toHaveText("✓ تمت");
  await expect(page.getByTestId("rest-timer")).toBeVisible();

  // البدائل: الجهاز غير موجود
  await page.getByTestId("open-alternatives").click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("البديل الأول")).toBeVisible();
  await expect(dialog.getByText("البديل الثاني")).toBeVisible();
  await dialog.getByTestId("missing-device").click();
  await expect(dialog.getByTestId("ranked-list")).toBeVisible();
  await expect(dialog.getByText("تشابه العضلات والحركة المستهدفة")).toBeVisible();
  const first = dialog.getByTestId("ranked-list").getByTestId("alt-card").first();
  const chosenName = (await first.locator(".font-bold").nth(1).textContent())!.trim();
  await first.getByRole("button").last().click();
  // إن كانت الملاءمة غير واضحة يُطلب التأكيد
  const confirm = dialog.getByRole("button", { name: "أؤكد الاختيار" });
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await expect(page.getByTestId("exercise-name")).toHaveText(chosenName);
  await expect(page.getByText("بديل لـ سحب عالي (لات بول داون)")).toBeVisible();

  // الانتقال للتالي ثم الكارديو والإنهاء
  await page.getByTestId("next-exercise").click();
  await expect(page.getByTestId("exercise-name")).toHaveText("ضغط كتف على الجهاز");
  await page.getByRole("button", { name: "كارديو" }).click();
  await page.getByTestId("cardio-done").click();
  await expect(page.getByTestId("cardio-minutes")).toHaveValue("10");
  await page.getByTestId("to-finish").click();
  await page.getByTestId("finish-session").click();
  await page.getByTestId("confirm-finish").click();
  await expect(page.getByText("تم تسجيل إنهاء الحصة")).toBeVisible();

  await page.goto("/");
  await expect(page.getByTestId("program-pct")).toHaveText("1%");
  await expect(page.getByText("1 / 3")).toBeVisible();
  // البرنامج الأساسي لم يتغير
  await page.goto("/program/session/?id=w01-B");
  await expect(page.getByTestId("session-exercises")).toContainText("سحب عالي (لات بول داون)");
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

test("الدليل: بحث وتصفية وصورة بديلة وروابط بحث", async ({ page }) => {
  await setup(page);
  await page.goto("/library/");
  await page.getByTestId("library-search").fill("leg press");
  await expect(page.getByTestId("library-list").locator("li").first()).toContainText("دفع الأرجل");
  await page.getByTestId("library-search").fill("سحب عالى");
  await expect(page.getByTestId("library-list")).toContainText("سحب عالي");
  await page.getByTestId("library-search").fill("");
  await page.getByRole("button", { name: "السمانة" }).click();
  const names = await page.getByTestId("library-list").locator("li .font-bold").allTextContents();
  expect(names.length).toBeGreaterThan(2);
  expect(names).toContain("سمانة جلوس على الجهاز");
  expect(names).not.toContain("ضغط صدر على الجهاز");
  await page.getByRole("button", { name: "الكل" }).click();

  await page.goto("/library/exercise/?id=leg_extension");
  await expect(page.getByTestId("image-placeholder").first()).toBeVisible();
  await expect(page.getByText("لا توجد صورة موثقة").first()).toBeVisible();
  await expect(page.getByText("يحتاج مراجعة متخصص").first()).toBeVisible();
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
  await expect(page.getByText("131.6 كجم")).toBeVisible();

  await page.goto("/settings/");
  await page.getByTestId("start-weight").fill("132");
  await page.getByTestId("theme-dark").click();
  await page.getByTestId("save-settings").click();
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
