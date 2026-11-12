import type { ExerciseContent } from "@/lib/types";
import { LOWER } from "./lower";
import { UPPER } from "./upper";

/** المحتوى الإضافي لكل تمرين مدمج: الإنجليزية + وضع البداية + الأخطاء الشائعة التفصيلية */
export const CONTENT: Record<string, ExerciseContent> = { ...UPPER, ...LOWER };
