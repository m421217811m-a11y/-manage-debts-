# إدارة ديوني

تطبيق Android عربي لإدارة الديون والدفعات الشخصية، يعمل دون اتصال ويحفظ البيانات محليًا على الجهاز.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/manage-debts/app/` — شاشات Expo Router: الرئيسية، الأشخاص، العمليات، التقارير، الإعدادات، onboarding، وتفاصيل السجلات.
- `artifacts/manage-debts/lib/AppContext.tsx` — الحالة المحلية وطبقة التخزين عبر AsyncStorage.
- `artifacts/manage-debts/lib/finance.ts` — الحسابات المالية بوحدة أصغر للعملة، وإعادة حساب الأرصدة من سجل العمليات.
- `artifacts/manage-debts/constants/colors.ts` — ألوان الهوية الفاتحة والداكنة.
- `artifacts/manage-debts/assets/images/icon.png` — أيقونة التطبيق المستخدمة أيضًا في splash/adaptive icon.

## Architecture decisions

- التطبيق frontend-only في النسخة الأولى؛ لا توجد حسابات أو شبكة أو قاعدة بيانات سحابية.
- يتم تخزين المبالغ كأعداد صحيحة بوحدة أصغر بدل floating point لتفادي أخطاء الحسابات المالية.
- لا يتم جمع العملات المختلفة؛ كل رصيد يُحسب ويُعرض ضمن عملته.
- رصيد الشخص ناتج عن سجل العمليات، وليس قيمة مخزنة منفصلة قابلة للتضارب.

## Product

- تجربة عربية RTL لإضافة الأشخاص، تسجيل الديون والدفعات، عرض الأرصدة، مراجعة سجل الحساب، تعديل وحذف العمليات، والتقارير الأساسية.
- يدعم الشيكل والدولار واليورو والدينار الأردني، مع وضع ليلي اختياري وبيانات محفوظة محليًا.

## User preferences

- واجهة عربية بالكامل باسم «إدارة ديوني» وشعار «كل ديونك، بوضوح.»
- الهوية البصرية هادئة وفخمة بأخضر غابة عميق وخلفية عاجية، مع نصوص مالية واضحة.

## Gotchas

- معاينة Expo تعمل عبر workflow `artifacts/manage-debts: expo`.
- التطبيق موجّه للتثبيت المباشر على Android، وليس للنشر على Google Play.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
