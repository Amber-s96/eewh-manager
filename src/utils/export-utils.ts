import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { Project } from '../types'

const STAGES = ['前期評估', '圖說蒐集', '計算檢討', '圖說修改', '產製報告書', '待審查', '候選結案']

function stageStats(p: Project) {
  const total = p.tasks.length
  const done  = p.tasks.filter(t => t.completed).length
  const pct   = total > 0 ? Math.round(done / total * 100) : 0
  return { total, done, pct }
}

// ── PDF ───────────────────────────────────────────────────────────────────────

export function exportPDF(projects: Project[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // 標題
  doc.setFontSize(16)
  doc.setTextColor(44, 58, 44)
  doc.text('EEWH Manager — 專案進度報告', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(140, 140, 140)
  doc.text(`產製日期：${new Date().toLocaleDateString('zh-TW')}`, 14, 22)

  // 摘要列
  const totalTasks = projects.flatMap(p => p.tasks).length
  const doneTasks  = projects.flatMap(p => p.tasks).filter(t => t.completed).length
  doc.setFontSize(9)
  doc.setTextColor(44, 58, 44)
  doc.text(
    `共 ${projects.length} 件案子・${totalTasks} 項子任務・整體完成率 ${totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0}%`,
    14, 28,
  )

  // 專案進度表
  autoTable(doc, {
    startY: 33,
    head: [['建案名稱', '類型', '等級', '目前階段', '子任務完成', '進度 %', '地址']],
    body: projects.map(p => {
      const { total, done, pct } = stageStats(p)
      return [p.name, p.type, p.grade, p.stage, `${done} / ${total}`, `${pct}%`, p.address]
    }),
    styles:     { fontSize: 9, cellPadding: 3, textColor: [44, 58, 44] },
    headStyles: { fillColor: [92, 122, 92], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 245] },
    columnStyles: { 6: { cellWidth: 60 } },
  })

  // 各案件子任務明細（換頁）
  projects.forEach(p => {
    if (p.tasks.length === 0) return
    doc.addPage()
    doc.setFontSize(12)
    doc.setTextColor(44, 58, 44)
    doc.text(`${p.name} — 子任務明細`, 14, 14)

    autoTable(doc, {
      startY: 20,
      head: [['子任務標題', '所屬階段', '指標', '截止日期', '狀態', '備註']],
      body: p.tasks.map(t => [
        t.title,
        t.stage,
        t.indicator ?? '—',
        t.dueDate   || '—',
        t.completed ? '✓ 完成' : '待處理',
        t.notes     || '—',
      ]),
      styles:     { fontSize: 8, cellPadding: 2.5, textColor: [44, 58, 44] },
      headStyles: { fillColor: [168, 197, 168], textColor: [44, 58, 44], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 245] },
      didParseCell(data) {
        if (data.column.index === 4 && data.cell.raw === '✓ 完成') {
          data.cell.styles.textColor = [74, 106, 74]
        }
      },
    })
  })

  doc.save(`EEWH-報告-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Excel ─────────────────────────────────────────────────────────────────────

export function exportExcel(projects: Project[]) {
  const wb = XLSX.utils.book_new()

  // Sheet 1：專案總覽
  const overviewRows = [
    ['建案名稱', '類型', '等級', '目前階段', '完成子任務', '總子任務', '進度%', '聯絡窗口', '地址', '案號'],
    ...projects.map(p => {
      const { total, done, pct } = stageStats(p)
      return [p.name, p.type, p.grade, p.stage, done, total, pct, p.contact, p.address, p.publicCode]
    }),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(overviewRows)
  ws1['!cols'] = [28, 8, 10, 12, 12, 10, 8, 16, 36, 18].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws1, '專案總覽')

  // Sheet 2：子任務明細（所有案件）
  const taskRows = [
    ['建案名稱', '子任務標題', '所屬階段', '指標', '截止日期', '指派成員', '狀態', '完成時間', '備註'],
    ...projects.flatMap(p =>
      p.tasks.map(t => [
        p.name,
        t.title,
        t.stage,
        t.indicator ?? '',
        t.dueDate   || '',
        t.assignees.join('、'),
        t.completed ? '完成' : '待處理',
        t.completedAt ? t.completedAt.slice(0, 10) : '',
        t.notes || '',
      ])
    ),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(taskRows)
  ws2['!cols'] = [28, 32, 12, 12, 12, 16, 8, 12, 40].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws2, '子任務明細')

  // Sheet 3：各階段統計
  const stageCount = STAGES.map(s => ({
    stage: s,
    count: projects.filter(p => p.stage === s).length,
  }))
  const statsRows = [
    ['進行階段', '案件數'],
    ...stageCount.map(r => [r.stage, r.count]),
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(statsRows)
  ws3['!cols'] = [16, 10].map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws3, '階段統計')

  XLSX.writeFile(wb, `EEWH-報告-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
