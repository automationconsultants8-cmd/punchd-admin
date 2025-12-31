import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimeEntry {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  job: {
    name: string;
  };
  clockInTime: string;
  clockOutTime: string | null;
  breakMinutes: number;
  totalHours: number | null;
}

interface ExportOptions {
  title?: string;
  dateRange?: string;
  companyName?: string;
}

export const exportTimesheetsPDF = (
  timeEntries: TimeEntry[],
  options: ExportOptions = {}
) => {
  const {
    title = 'Timesheet Report',
    dateRange = '',
    companyName = 'ApexChronos'
  } = options;

  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(124, 58, 237); // Purple to match your theme
  doc.text(companyName, 14, 22);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 32);

  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(dateRange, 14, 40);
  }

  // Generated date
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

  // Table data
  const tableData = timeEntries.map((entry) => [
    `${entry.user.firstName} ${entry.user.lastName}`,
    entry.job.name,
    new Date(entry.clockInTime).toLocaleDateString(),
    new Date(entry.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    entry.clockOutTime
      ? new Date(entry.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Active',
    `${entry.breakMinutes || 0} min`,
    entry.totalHours ? `${entry.totalHours.toFixed(2)} hrs` : '-'
  ]);

  // Generate table
  autoTable(doc, {
    startY: 55,
    head: [['Worker', 'Job Site', 'Date', 'Clock In', 'Clock Out', 'Break', 'Total Hours']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237], // Purple
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 243, 255] // Light purple tint
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Summary section
  const totalHours = timeEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
  const totalBreakMinutes = timeEntries.reduce((sum, e) => sum + (e.breakMinutes || 0), 0);
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Entries: ${timeEntries.length}`, 14, finalY);
  doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, finalY + 6);
  doc.text(`Total Break Time: ${Math.floor(totalBreakMinutes / 60)}h ${totalBreakMinutes % 60}m`, 14, finalY + 12);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | ApexChronos Time & Attendance`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `timesheet-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Cost Analytics PDF Export
interface CostData {
  workerName: string;
  regularHours: number;
  overtimeHours: number;
  regularCost: number;
  overtimeCost: number;
  totalCost: number;
}

export const exportCostAnalyticsPDF = (
  costData: CostData[],
  options: ExportOptions = {}
) => {
  const {
    title = 'Labor Cost Report',
    dateRange = '',
    companyName = 'ApexChronos'
  } = options;

  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(124, 58, 237);
  doc.text(companyName, 14, 22);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 32);

  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(dateRange, 14, 40);
  }

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

  // Table
  const tableData = costData.map((row) => [
    row.workerName,
    row.regularHours.toFixed(2),
    row.overtimeHours.toFixed(2),
    `$${row.regularCost.toFixed(2)}`,
    `$${row.overtimeCost.toFixed(2)}`,
    `$${row.totalCost.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Worker', 'Regular Hrs', 'OT Hrs', 'Regular Cost', 'OT Cost', 'Total Cost']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 243, 255]
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  // Totals
  const totalRegular = costData.reduce((sum, r) => sum + r.regularCost, 0);
  const totalOT = costData.reduce((sum, r) => sum + r.overtimeCost, 0);
  const grandTotal = costData.reduce((sum, r) => sum + r.totalCost, 0);

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Regular Cost: $${totalRegular.toFixed(2)}`, 14, finalY);
  doc.text(`Total Overtime Cost: $${totalOT.toFixed(2)}`, 14, finalY + 7);
  doc.setTextColor(124, 58, 237);
  doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 14, finalY + 14);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | ApexChronos Time & Attendance`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  const fileName = `cost-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};