/**
 * exportUtils.js
 * ============================================================
 * نظام تصدير مركزي ومنظّم للمشروع.
 *
 * يحتوي هذا الملف على:
 *  - CONFIG_EXCEL: إعدادات شيتات Excel (الأعمدة، عرضها، ألوان الترويسات)
 *  - CONFIG_PDF:   إعدادات التقرير الورقي (بيانات المشروع، التذييل)
 *  - exportToExcel(): دالة تصدير Excel
 *  - exportToPDF():  دالة تصدير/طباعة PDF
 *
 * لإضافة عمود جديد: أضف مدخلاً في الـ columns الخاصة بالشيت المطلوب.
 * لتغيير لون الترويسة: عدّل headerStyle في الشيت المطلوب.
 * ============================================================
 */

import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────
// ١. إعدادات تصدير Excel
// ─────────────────────────────────────────────────────────────

/**
 * CONFIG_EXCEL
 *
 * كل شيت يملك:
 *  - sheetName  : اسم الشيت داخل ملف Excel
 *  - headerStyle: أنماط ترويسة هذا الشيت (لون خلفية ARGB، خط، لون نص)
 *  - colWidths  : عرض كل عمود بالحرف (ch unit)
 *  - columns    : مصفوفة الأعمدة — كل عمود يملك:
 *                   • label : عنوان الترويسة المعروض في Excel
 *                   • get   : دالة تأخذ الصف وترجع قيمة الخلية
 */
export const CONFIG_EXCEL = {

  // ── الشيت الأول: الخلاصة العامة لجدول التقدم ──────────────
  summary: {
    sheetName: 'الخلاصة واللوحة التفاعلية',
    headerStyle: {
      fill: { fgColor: { rgb: 'F79012' } }, // ذهبي
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', readingOrder: 2 },
    },
    colWidths: [20, 32, 15, 15, 15, 18, 12, 30],
    columns: [
      { label: 'القسم الأساسي',           get: (t) => t.category_name },
      { label: 'تفاصيل الفقرة التنفيذية', get: (t) => t.name },
      { label: 'الكمية الكلية',            get: (t) => t.total_quantity ?? '-' },
      { label: 'المنجز',                   get: (t) => t.completed_quantity ?? '-' },
      {
        label: 'المتبقي',
        get: (t) =>
          t.total_quantity
            ? parseFloat((t.total_quantity - t.completed_quantity).toFixed(2))
            : '-',
      },
      { label: 'نسبة الإنجاز (%)',         get: (t) => parseFloat(t.progress_percent.toFixed(2)) },
      { label: 'الوحدة',                   get: (t) => t.unit ?? '-' },
      { label: 'الملاحظات الموقعية',       get: (t) => t.notes ?? '' },
    ],
  },

  // ── الشيت الثاني: سجل النزلات التفصيلي ───────────────────
  nazalat: {
    sheetName: 'سجل النزلات التفصيلي',
    headerStyle: {
      fill: { fgColor: { rgb: '1D4ED8' } }, // أزرق احترافي
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', readingOrder: 2 },
    },
    colWidths: [12, 18, 16, 18, 16, 30],
    columns: [
      { label: 'التسلسلي',          get: (n) => n.serial_number },
      { label: 'المنطقة (Zone)',     get: (n) => n.zone },
      { label: 'رمز النزلة',        get: (n) => n.code },
      { label: 'الحالة الموقعية',   get: (n) => n.status },
      { label: 'الكمية الكلية',     get: (n) => n.total_quantity },
      { label: 'الملاحظات الموقعية', get: (n) => n.notes ?? '' },
    ],
  },

  // ── الشيت الثالث: توزيع المرمر ────────────────────────────
  marble: {
    sheetName: 'توزيع المرمر والزونات',
    headerStyle: {
      fill: { fgColor: { rgb: '16A34A' } }, // أخضر
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', readingOrder: 2 },
    },
    colWidths: [18, 28, 16, 16, 14, 28],
    columns: [
      { label: 'المنطقة (Zone)',           get: (m) => m.zone },
      { label: 'طبيعة وفقرة العمل',        get: (m) => m.task_name },
      { label: 'أبيض (قطعة)',              get: (m) => m.white_qty ?? '-' },
      { label: 'جوزي (قطعة)',             get: (m) => m.brown_qty ?? '-' },
      {
        label: 'الإجمالي',
        get: (m) => (m.white_qty || 0) + (m.brown_qty || 0) || '-',
      },
      { label: 'موقف التحديث الميداني',   get: (m) => m.status ?? '' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// ٢. إعدادات تصدير PDF
// ─────────────────────────────────────────────────────────────

export const CONFIG_PDF = {
  /** عنوان التقرير الرئيسي */
  reportTitle: 'تقرير متابعة نسب الإنجاز التراكمية',

  /** اسم المشروع */
  projectName: 'موقع النصب التذكاري للجندي المجهول',

  /** الجهة المصدِرة */
  issuedBy: 'دائرة المهندس المقيم',

  /** التوقيعات في ذيل التقرير المطبوع */
  signatures: [
    { title: 'المهندس المقيم',           subtitle: 'التوقيع والختم: .........................' },
    { title: 'ممثل الجهة المستفيدة',    subtitle: 'التوقيع والختم: .........................' },
    { title: 'مدير المشروع / الاستشاري', subtitle: 'التوقيع والختم: .........................' },
  ],
};

// ─────────────────────────────────────────────────────────────
// ٣. مساعدات داخلية
// ─────────────────────────────────────────────────────────────

/** بناء شيت واحد من إعداد CONFIG_EXCEL + مصفوفة البيانات */
function buildSheet(config, rows) {
  // بناء مصفوفة البيانات كـ AOA (Array of Arrays)
  const header = config.columns.map((c) => c.label);
  const data = rows.map((row) => config.columns.map((c) => c.get(row)));

  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  // عرض الأعمدة
  ws['!cols'] = config.colWidths.map((w) => ({ wch: w }));

  // ارتفاع صف الترويسة
  ws['!rows'] = [{ hpt: 22 }];

  // تطبيق النمط على خلايا الترويسة
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = config.headerStyle;
  }

  return ws;
}

/** اسم ملف التصدير بتاريخ اليوم */
function buildFileName(prefix) {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.xlsx`;
}

// ─────────────────────────────────────────────────────────────
// ٤. دالة التصدير الرئيسية — Excel
// ─────────────────────────────────────────────────────────────

/**
 * exportToExcel
 * @param {{ tasks: Array, nazalat: Array, marble: Array }} data
 */
export function exportToExcel({ tasks, nazalat, marble }) {
  try {
    const wb = XLSX.utils.book_new();

    // ── الشيت الأول ──
    const wsSummary = buildSheet(CONFIG_EXCEL.summary, tasks);
    XLSX.utils.book_append_sheet(wb, wsSummary, CONFIG_EXCEL.summary.sheetName);

    // ── الشيت الثاني ──
    const wsNazalat = buildSheet(CONFIG_EXCEL.nazalat, nazalat);
    XLSX.utils.book_append_sheet(wb, wsNazalat, CONFIG_EXCEL.nazalat.sheetName);

    // ── الشيت الثالث ──
    const wsMarble = buildSheet(CONFIG_EXCEL.marble, marble);
    XLSX.utils.book_append_sheet(wb, wsMarble, CONFIG_EXCEL.marble.sheetName);

    // حفظ الملف
    XLSX.writeFile(wb, buildFileName('تقرير_انجاز_المشروع'), {
      bookType: 'xlsx',
      type: 'binary',
    });
  } catch (err) {
    console.error('[exportToExcel] فشل التصدير:', err);
    alert('حدث خطأ أثناء تصدير ملف Excel. راجع الكونسول للتفاصيل.');
  }
}

// ─────────────────────────────────────────────────────────────
// ٥. دالة التصدير الرئيسية — PDF (طباعة)
// ─────────────────────────────────────────────────────────────

/**
 * exportToPDF
 * يحضّر بيانات الترويسة في DOM ثم يطلق window.print()
 */
export function exportToPDF() {
  try {
    window.print();
  } catch (err) {
    console.error('[exportToPDF] فشل الطباعة:', err);
    alert('حدث خطأ أثناء فتح نافذة الطباعة.');
  }
}
