import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "allow" });

test("الصفحات المخزنة تعمل دون اتصال بعد أول تحميل", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  // انتظار اكتمال التخزين المسبق
  await expect
    .poll(async () => page.evaluate(async () => (await caches.keys()).length), { timeout: 20_000 })
    .toBeGreaterThan(0);
  await expect
    .poll(async () => page.evaluate(async () => (await (await caches.open((await caches.keys())[0])).keys()).length), { timeout: 20_000 })
    .toBeGreaterThan(50);

  await context.setOffline(true);
  for (const [path, text] of [
    ["/library/", "دليل العضلات والأجهزة"],
    ["/progress/", "متابعة التقدم"],
    ["/workout/?session=w01-A", "ابدأ الحصة"],
    ["/library/exercise/?id=leg_press", "دفع الأرجل (ليج برس)"],
    ["/settings/", "الإعدادات"],
  ] as const) {
    await page.goto(path);
    await expect(page.getByText(text).first()).toBeVisible();
  }
  await expect(page.getByText("أنت غير متصل بالإنترنت")).toBeVisible();
  // التنقل داخل التطبيق دون اتصال
  await page.getByRole("navigation", { name: "التنقل الرئيسي" }).getByRole("link", { name: "الرئيسية" }).click();
  await expect(page.getByTestId("today-date")).toBeVisible();
  await context.setOffline(false);
});
