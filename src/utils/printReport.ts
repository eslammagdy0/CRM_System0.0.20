import { Customer, Interaction, Deal, Task } from '../types';

export const generatePrintableReport = (
  customers: Customer[],
  interactions: Interaction[],
  deals: Deal[],
  tasks: Task[],
  startDate: string,
  endDate: string,
  currency: string,
  language: string = 'ar'
) => {
  // Filter data by date range
  const filterByDate = (date: string) => {
    const itemDate = new Date(date);
    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
  };
  
  const filteredCustomers = customers.filter(c => filterByDate(c.createdAt));
  const filteredInteractions = interactions.filter(i => filterByDate(i.date));
  const filteredDeals = deals.filter(d => filterByDate(d.createdAt));
  const filteredTasks = tasks.filter(t => filterByDate(t.createdAt));
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (language === 'ar') {
      const symbols = { EGP: 'ج.م', USD: '$', EUR: '€', SAR: 'ر.س', AED: 'د.إ' };
      return `${amount.toLocaleString('ar-EG')} ${symbols[currency as keyof typeof symbols] || 'ج.م'}`;
    } else {
      const symbols = { EGP: 'EGP', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED' };
      return `${symbols[currency as keyof typeof symbols] || 'EGP'} ${amount.toLocaleString('en-US')}`;
    }
  };
  
  // Calculate statistics
  const closedDeals = filteredDeals.filter(d => d.status === 'مغلق');
  const closedDealsValue = closedDeals.reduce((sum, d) => sum + d.value, 0);
  const expectedValue = filteredDeals
    .filter(d => d.status === 'جاري')
    .reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
  
  const customerTypes = filteredCustomers.reduce((acc, customer) => {
    acc[customer.type] = (acc[customer.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const interactionTypes = filteredInteractions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const positiveInteractions = filteredInteractions.filter(i => i.outcome === 'إيجابي').length;
  const successRate = filteredInteractions.length > 0 ? 
    Math.round((positiveInteractions / filteredInteractions.length) * 100) : 0;
  
  // Create printable HTML
  const printContent = `
    <div class="print-container" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <div class="print-header">
        <div class="print-title">${language === 'ar' ? 'تقرير نظام إدارة العملاء' : 'CRM System Report'}</div>
        <div class="print-date">
          ${language === 'ar' ? 'فترة التقرير:' : 'Report Period:'} ${new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date(endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
        <div class="print-date">
          ${language === 'ar' ? 'تاريخ الإنشاء:' : 'Generated on:'} ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'الإحصائيات العامة' : 'General Statistics'}</div>
        <div class="print-stats-grid">
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'العملاء الجدد' : 'New Customers'}</div>
            <div class="print-stat-value">${filteredCustomers.length}</div>
          </div>
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'إجمالي التفاعلات' : 'Total Interactions'}</div>
            <div class="print-stat-value">${filteredInteractions.length}</div>
          </div>
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'الصفقات المغلقة' : 'Closed Deals'}</div>
            <div class="print-stat-value">${closedDeals.length}</div>
          </div>
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'قيمة الصفقات المغلقة' : 'Closed Deals Value'}</div>
            <div class="print-stat-value">${formatCurrency(closedDealsValue)}</div>
          </div>
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'القيمة المتوقعة' : 'Expected Value'}</div>
            <div class="print-stat-value">${formatCurrency(expectedValue)}</div>
          </div>
          <div class="print-stat-item">
            <div class="print-stat-label">${language === 'ar' ? 'معدل النجاح' : 'Success Rate'}</div>
            <div class="print-stat-value">${successRate}%</div>
          </div>
        </div>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'تصنيف العملاء' : 'Customer Classification'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'نوع العميل' : 'Customer Type'}</th>
              <th>${language === 'ar' ? 'العدد' : 'Count'}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(customerTypes).map(([type, count]) => `
              <tr>
                <td>${language === 'ar' ? type : 
                  (type === 'جديد' || type === 'new' ? 'New' :
                   type === 'محتمل' || type === 'potential' ? 'Potential' :
                   type === 'دائم' || type === 'permanent' ? 'Permanent' : type)}</td>
                <td>${count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'تحليل التفاعلات' : 'Interactions Analysis'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'نوع التفاعل' : 'Interaction Type'}</th>
              <th>${language === 'ar' ? 'العدد' : 'Count'}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(interactionTypes).map(([type, count]) => `
              <tr>
                <td>${language === 'ar' ? type : 
                  (type === 'مكالمة' || type === 'call' ? 'Call' :
                   type === 'مقابلة' || type === 'meeting' ? 'Meeting' :
                   type === 'إيميل' || type === 'email' ? 'Email' :
                   type === 'رسالة' || type === 'message' ? 'Message' : type)}</td>
                <td>${count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'أداء الصفقات' : 'Deals Performance'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'حالة الصفقة' : 'Deal Status'}</th>
              <th>${language === 'ar' ? 'العدد' : 'Count'}</th>
              <th>${language === 'ar' ? 'القيمة الإجمالية' : 'Total Value'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${language === 'ar' ? 'جاري' : 'Ongoing'}</td>
              <td>${filteredDeals.filter(d => d.status === 'جاري').length}</td>
              <td>${formatCurrency(filteredDeals.filter(d => d.status === 'جاري').reduce((sum, d) => sum + d.value, 0))}</td>
            </tr>
            <tr>
              <td>${language === 'ar' ? 'مغلق' : 'Closed'}</td>
              <td>${closedDeals.length}</td>
              <td>${formatCurrency(closedDealsValue)}</td>
            </tr>
            <tr>
              <td>${language === 'ar' ? 'مرفوض' : 'Rejected'}</td>
              <td>${filteredDeals.filter(d => d.status === 'مرفوض').length}</td>
              <td>${formatCurrency(filteredDeals.filter(d => d.status === 'مرفوض').reduce((sum, d) => sum + d.value, 0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'حالة المهام' : 'Tasks Status'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'حالة المهمة' : 'Task Status'}</th>
              <th>${language === 'ar' ? 'العدد' : 'Count'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${language === 'ar' ? 'قيد الانتظار' : 'Pending'}</td>
              <td>${filteredTasks.filter(t => t.status === 'قيد الانتظار').length}</td>
            </tr>
            <tr>
              <td>${language === 'ar' ? 'جاري' : 'In Progress'}</td>
              <td>${filteredTasks.filter(t => t.status === 'جاري').length}</td>
            </tr>
            <tr>
              <td>${language === 'ar' ? 'مكتمل' : 'Completed'}</td>
              <td>${filteredTasks.filter(t => t.status === 'مكتمل').length}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="print-footer">
        <div>${language === 'ar' ? 'تم إنشاء هذا التقرير بواسطة نظام إدارة العملاء (CRM)' : 'This report was generated by CRM System'}</div>
        <div>${language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'} © ${new Date().getFullYear()}</div>
      </div>
    </div>
  `;
  
  return printContent;
};

export const printReport = (
  customers: Customer[],
  interactions: Interaction[],
  deals: Deal[],
  tasks: Task[],
  startDate: string,
  endDate: string,
  currency: string,
  language: string = 'ar'
) => {
  const printContent = generatePrintableReport(
    customers, interactions, deals, tasks, startDate, endDate, currency, language
  );
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${language === 'ar' ? 'تقرير نظام إدارة العملاء' : 'CRM System Report'}</title>
        <style>
          ${getReportStyles()}
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};

const getReportStyles = () => `
  body {
    font-family: 'Arial', sans-serif;
    font-size: 12pt;
    line-height: 1.4;
    color: #000;
    background: white;
    margin: 0;
    padding: 20px;
  }
  
  .print-container {
    max-width: none;
    margin: 0;
    padding: 0;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 15px;
  }
  
  .print-title {
    font-size: 24pt;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .print-date {
    font-size: 14pt;
    color: #666;
    margin-bottom: 5px;
  }
  
  .print-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }
  
  .print-section-title {
    font-size: 18pt;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 5px;
  }
  
  .print-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .print-stat-item {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 5px;
  }
  
  .print-stat-label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .print-stat-value {
    font-size: 16pt;
    font-weight: bold;
    color: #333;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .print-table th,
  .print-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: right;
  }
  
  .print-table th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 30px;
    text-align: center;
    font-size: 10pt;
    color: #666;
    border-top: 1px solid #ccc;
    padding-top: 15px;
  }
  
  /* RTL Support */
  [dir="rtl"] {
    direction: rtl;
    text-align: right;
  }
  
  [dir="rtl"] .print-table th,
  [dir="rtl"] .print-table td {
    text-align: right;
  }
  
  [dir="rtl"] .print-header {
    text-align: center;
  }
`;