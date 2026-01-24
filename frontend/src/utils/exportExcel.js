import * as XLSX from 'xlsx';

/**
 * Export expenses to Excel
 * @param {Array} expenses - Array of expense objects
 * @param {Object} filters - Filter information (period, date)
 * @param {number} subtotal - Total amount
 */
export const exportToExcel = (expenses, filters = {}, subtotal = 0) => {
    // Prepare data
    const data = expenses.map((expense, index) => ({
        '#': index + 1,
        'Producto': expense.product_name,
        'Cantidad': expense.quantity,
        'Precio Unitario': parseFloat(expense.unit_price).toFixed(2),
        'Total': parseFloat(expense.total).toFixed(2),
        'Fecha': new Date(expense.expense_date).toLocaleDateString('es-ES'),
        'Usuario': expense.username || 'N/A'
    }));

    // Add summary rows
    data.push({});
    data.push({
        '#': '',
        'Producto': 'RESUMEN',
        'Cantidad': '',
        'Precio Unitario': '',
        'Total': '',
        'Fecha': '',
        'Usuario': ''
    });
    data.push({
        '#': '',
        'Producto': 'Total de registros:',
        'Cantidad': expenses.length,
        'Precio Unitario': '',
        'Total': '',
        'Fecha': '',
        'Usuario': ''
    });
    data.push({
        '#': '',
        'Producto': 'Subtotal:',
        'Cantidad': '',
        'Precio Unitario': '',
        'Total': `$${subtotal.toFixed(2)}`,
        'Fecha': '',
        'Usuario': ''
    });

    if (filters.period && filters.date) {
        const periodText = {
            day: 'Día',
            month: 'Mes',
            year: 'Año'
        };
        data.push({
            '#': '',
            'Producto': 'Período:',
            'Cantidad': `${periodText[filters.period]} - ${filters.date}`,
            'Precio Unitario': '',
            'Total': '',
            'Fecha': '',
            'Usuario': ''
        });
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos');

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // #
        { wch: 30 }, // Producto
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Precio Unitario
        { wch: 15 }, // Total
        { wch: 12 }, // Fecha
        { wch: 15 }  // Usuario
    ];

    // Save file
    const filename = `reporte-gastos-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
};
