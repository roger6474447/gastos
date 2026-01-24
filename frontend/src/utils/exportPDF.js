import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export expenses to PDF
 * @param {Array} expenses - Array of expense objects
 * @param {Object} filters - Filter information (period, date)
 * @param {number} subtotal - Total amount
 */
export const exportToPDF = (expenses, filters = {}, subtotal = 0) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Blue color
    doc.text('Reporte de Gastos', 14, 20);

    // Filter info
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (filters.period && filters.date) {
        const periodText = {
            day: 'Día',
            month: 'Mes',
            year: 'Año'
        };
        doc.text(`Período: ${periodText[filters.period]} - ${filters.date}`, 14, 28);
    }
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 34);

    // Table
    const tableData = expenses.map((expense, index) => [
        index + 1,
        expense.product_name,
        expense.quantity,
        `$${parseFloat(expense.unit_price).toFixed(2)}`,
        `$${parseFloat(expense.total).toFixed(2)}`,
        new Date(expense.expense_date).toLocaleDateString('es-ES'),
        expense.username || 'N/A'
    ]);

    doc.autoTable({
        startY: 40,
        head: [['#', 'Producto', 'Cantidad', 'Precio Unit.', 'Total', 'Fecha', 'Usuario']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [14, 165, 233],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 50 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 30 },
            6: { cellWidth: 30 }
        }
    });

    // Subtotal
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY);
    doc.text(`Total de registros: ${expenses.length}`, 14, finalY + 7);

    // Save
    const filename = `reporte-gastos-${Date.now()}.pdf`;
    doc.save(filename);
};
