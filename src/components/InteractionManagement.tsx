import React, { useState } from 'react';
import { Plus, CreditCard as Edit3, Trash2, Calendar, Clock, MessageSquare, Printer } from 'lucide-react';
import { Interaction, Customer } from '../types';
import { translations } from '../utils/translations';

interface InteractionManagementProps {
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  customers: Customer[];
  language: string;
}

const InteractionManagement: React.FC<InteractionManagementProps> = ({ 
  interactions, 
  setInteractions, 
  customers,
  language
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [searchStartDate, setSearchStartDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [searchEndDate, setSearchEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: (language === 'ar' ? 'مكالمة' : 'call') as const,
    date: new Date().toISOString().slice(0, 16), // Current date and time
    duration: 0,
    outcome: (language === 'ar' ? 'محايد' : 'neutral') as const,
    notes: '',
    nextAction: ''
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const printInteractions = () => {
    const printContent = generateInteractionsPrintContent(filteredInteractions, customers, language, t, searchStartDate, searchEndDate);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${language === 'ar' ? 'تقرير التفاعلات' : 'Interactions Report'}</title>
          <style>${getPrintStyles()}</style>
        </head>
        <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to match current language
    const processedFormData = {
      ...formData,
      type: language === 'ar' ? 
        (formData.type === 'call' ? 'مكالمة' : 
         formData.type === 'meeting' ? 'مقابلة' : 
         formData.type === 'email' ? 'إيميل' : 
         formData.type === 'message' ? 'رسالة' : formData.type) : 
        (formData.type === 'مكالمة' ? 'call' : 
         formData.type === 'مقابلة' ? 'meeting' : 
         formData.type === 'إيميل' ? 'email' : 
         formData.type === 'رسالة' ? 'message' : formData.type),
      outcome: language === 'ar' ? 
        (formData.outcome === 'positive' ? 'إيجابي' : 
         formData.outcome === 'negative' ? 'سلبي' : 
         formData.outcome === 'neutral' ? 'محايد' : formData.outcome) : 
        (formData.outcome === 'إيجابي' ? 'positive' : 
         formData.outcome === 'سلبي' ? 'negative' : 
         formData.outcome === 'محايد' ? 'neutral' : formData.outcome)
    };

    const interactionData: Interaction = {
      id: editingInteraction?.id || Date.now().toString(),
      ...processedFormData,
    };

    if (editingInteraction) {
      setInteractions(prev => prev.map(interaction => 
        interaction.id === editingInteraction.id ? interactionData : interaction
      ));
    } else {
      setInteractions(prev => [...prev, interactionData]);
    }

    // Update customer's last contact date
    const customer = customers.find(c => c.id === formData.customerId);
    if (customer) {
      customer.lastContact = formData.date;
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      type: language === 'ar' ? 'مكالمة' : 'call',
      date: new Date().toISOString().slice(0, 16), // Reset to current time
      duration: 0,
      outcome: language === 'ar' ? 'محايد' : 'neutral',
      notes: '',
      nextAction: ''
    });
    setShowForm(false);
    setEditingInteraction(null);
  };

  const handleEdit = (interaction: Interaction) => {
    // Convert interaction data to match current language for editing
    const convertedType = language === 'ar' ? 
      (interaction.type === 'call' ? 'مكالمة' : 
       interaction.type === 'meeting' ? 'مقابلة' : 
       interaction.type === 'email' ? 'إيميل' : 
       interaction.type === 'message' ? 'رسالة' : interaction.type) : 
      (interaction.type === 'مكالمة' ? 'call' : 
       interaction.type === 'مقابلة' ? 'meeting' : 
       interaction.type === 'إيميل' ? 'email' : 
       interaction.type === 'رسالة' ? 'message' : interaction.type);

    const convertedOutcome = language === 'ar' ? 
      (interaction.outcome === 'positive' ? 'إيجابي' : 
       interaction.outcome === 'negative' ? 'سلبي' : 
       interaction.outcome === 'neutral' ? 'محايد' : interaction.outcome) : 
      (interaction.outcome === 'إيجابي' ? 'positive' : 
       interaction.outcome === 'سلبي' ? 'negative' : 
       interaction.outcome === 'محايد' ? 'neutral' : interaction.outcome);

    setFormData({
      customerId: interaction.customerId,
      type: convertedType,
      date: interaction.date,
      duration: interaction.duration || 0,
      outcome: convertedOutcome,
      notes: interaction.notes,
      nextAction: interaction.nextAction || ''
    });
    setEditingInteraction(interaction);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDeleteInteraction'))) {
      setInteractions(prev => prev.filter(interaction => interaction.id !== id));
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || t('unknownCustomer');
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'إيجابي': return 'bg-green-100 text-green-800';
      case 'positive': return 'bg-green-100 text-green-800';
      case 'سلبي': return 'bg-red-100 text-red-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'محايد': return 'bg-gray-100 text-gray-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    if (language === 'ar') {
      switch (outcome) {
        case 'positive': return 'إيجابي';
        case 'negative': return 'سلبي';
        case 'neutral': return 'محايد';
        default: return outcome;
      }
    } else {
      switch (outcome) {
        case 'إيجابي': return 'Positive';
        case 'سلبي': return 'Negative';
        case 'محايد': return 'Neutral';
        default: return outcome;
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'مكالمة': return <Clock className="h-4 w-4" />;
      case 'call': return <Clock className="h-4 w-4" />;
      case 'مقابلة': return <Calendar className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'إيميل': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <MessageSquare className="h-4 w-4" />;
      case 'رسالة': return <MessageSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (language === 'ar') {
      switch (type) {
        case 'call': return 'مكالمة';
        case 'meeting': return 'مقابلة';
        case 'email': return 'إيميل';
        case 'message': return 'رسالة';
        default: return type;
      }
    } else {
      switch (type) {
        case 'مكالمة': return 'Call';
        case 'مقابلة': return 'Meeting';
        case 'إيميل': return 'Email';
        case 'رسالة': return 'Message';
        default: return type;
      }
    }
  };

  const filterInteractions = () => {
    return interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date).toISOString().slice(0, 10);
      const matchesDateRange = interactionDate >= searchStartDate && interactionDate <= searchEndDate;
      
      if (outcomeFilter === 'all') {
        return matchesDateRange;
      }
      
      // Handle filter matching for both languages
      const matchesOutcome = interaction.outcome === outcomeFilter ||
        (language === 'ar' && (
          (outcomeFilter === 'إيجابي' && interaction.outcome === 'positive') ||
          (outcomeFilter === 'سلبي' && interaction.outcome === 'negative') ||
          (outcomeFilter === 'محايد' && interaction.outcome === 'neutral')
        )) ||
        (language === 'en' && (
          (outcomeFilter === 'positive' && interaction.outcome === 'إيجابي') ||
          (outcomeFilter === 'negative' && interaction.outcome === 'سلبي') ||
          (outcomeFilter === 'neutral' && interaction.outcome === 'محايد')
        ));
      
      return matchesDateRange && matchesOutcome;
    });
  };

  const filteredInteractions = filterInteractions();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('interactionManagement')}</h2>
          <div className={"flex flex-wrap gap-2 " + (language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3')}>
            <button
              onClick={printInteractions}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              <Printer className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('printReport')}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('addNewInteraction')}
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'ar' ? 'البحث والفلترة' : 'Search & Filter'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'من تاريخ' : 'From Date'}
              </label>
              <input
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
              </label>
              <input
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('outcome')}
              </label>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{language === 'ar' ? 'جميع النتائج' : 'All Outcomes'}</option>
                <option value={language === 'ar' ? 'إيجابي' : 'positive'}>{t('positive')}</option>
                <option value={language === 'ar' ? 'سلبي' : 'negative'}>{t('negative')}</option>
                <option value={language === 'ar' ? 'محايد' : 'neutral'}>{t('neutral')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {language === 'ar' ? 'إجمالي النتائج:' : 'Total Results:'} {filteredInteractions.length}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredInteractions.map(interaction => (
            <div key={interaction.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    {getTypeIcon(interaction.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getCustomerName(interaction.customerId)} - {getTypeLabel(interaction.type)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(interaction.date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      {interaction.duration && interaction.duration > 0 && ` - ${interaction.duration} ${t('minutes')}`}
                    </p>
                  </div>
                </div>
                <div className={"flex items-center " + (language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2')}>
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + getOutcomeColor(interaction.outcome)}>
                    {getOutcomeLabel(interaction.outcome)}
                  </span>
                  <button
                    onClick={() => handleEdit(interaction)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(interaction.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {interaction.notes && (
                <p className="text-sm text-gray-700 mb-2 pr-11">{interaction.notes}</p>
              )}
              
              {interaction.nextAction && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 pr-11">
                  <p className="text-sm text-yellow-800">
                    <strong>{t('nextAction')}:</strong> {interaction.nextAction}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredInteractions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {interactions.length === 0 ? t('noInteractionsRecorded') : (language === 'ar' ? 'لا توجد تفاعلات في الفترة المحددة' : 'No interactions found in the selected period')}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingInteraction ? t('editInteraction') : t('addNewInteraction')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customer')}</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('selectCustomer')}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('interactionType')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'مكالمة' : 'call'}>{t('call')}</option>
                  <option value={language === 'ar' ? 'مقابلة' : 'meeting'}>{t('meeting')}</option>
                  <option value={language === 'ar' ? 'إيميل' : 'email'}>{t('email')}</option>
                  <option value={language === 'ar' ? 'رسالة' : 'message'}>{t('message')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dateTime')}</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('duration')} ({t('minutes')})</label>
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('outcome')}</label>
                <select
                  value={formData.outcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'إيجابي' : 'positive'}>{t('positive')}</option>
                  <option value={language === 'ar' ? 'سلبي' : 'negative'}>{t('negative')}</option>
                  <option value={language === 'ar' ? 'محايد' : 'neutral'}>{t('neutral')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('interactionNotes')}</label>
                <textarea
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nextAction')}</label>
                <textarea
                  value={formData.nextAction}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextAction: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder={t('nextActionPlaceholder')}
                />
              </div>

              <div className={"flex justify-end " + (language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3') + " pt-4"}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingInteraction ? t('update') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const generateInteractionsPrintContent = (interactions: Interaction[], customers: Customer[], language: string, t: (key: string) => string, startDate: string, endDate: string) => {
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || (language === 'ar' ? 'عميل غير معروف' : 'Unknown Customer');
  };

  const getTypeLabel = (type: string) => {
    if (language === 'ar') {
      switch (type) {
        case 'call': return 'مكالمة';
        case 'meeting': return 'مقابلة';
        case 'email': return 'إيميل';
        case 'message': return 'رسالة';
        default: return type;
      }
    } else {
      switch (type) {
        case 'مكالمة': return 'Call';
        case 'مقابلة': return 'Meeting';
        case 'إيميل': return 'Email';
        case 'رسالة': return 'Message';
        default: return type;
      }
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    if (language === 'ar') {
      switch (outcome) {
        case 'positive': return 'إيجابي';
        case 'negative': return 'سلبي';
        case 'neutral': return 'محايد';
        default: return outcome;
      }
    } else {
      switch (outcome) {
        case 'إيجابي': return 'Positive';
        case 'سلبي': return 'Negative';
        case 'محايد': return 'Neutral';
        default: return outcome;
      }
    }
  };

  return `
    <div class="print-container" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <div class="print-header">
        <div class="print-title">${language === 'ar' ? 'تقرير التفاعلات' : 'Interactions Report'}</div>
        <div class="print-date">
          ${language === 'ar' ? 'فترة التقرير:' : 'Report Period:'} ${new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date(endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
        <div class="print-date">
          ${language === 'ar' ? 'تاريخ الإنشاء:' : 'Generated on:'} ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'قائمة التفاعلات' : 'Interactions List'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'العميل' : 'Customer'}</th>
              <th>${language === 'ar' ? 'نوع التفاعل' : 'Type'}</th>
              <th>${language === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th>${language === 'ar' ? 'المدة' : 'Duration'}</th>
              <th>${language === 'ar' ? 'النتيجة' : 'Outcome'}</th>
            </tr>
          </thead>
          <tbody>
            ${interactions.map(interaction => `
              <tr>
                <td>${getCustomerName(interaction.customerId)}</td>
                <td>${getTypeLabel(interaction.type)}</td>
                <td>${new Date(interaction.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
                <td>${interaction.duration ? `${interaction.duration} ${language === 'ar' ? 'دقيقة' : 'min'}` : '-'}</td>
                <td>${getOutcomeLabel(interaction.outcome)}</td>
              </tr>
              ${interaction.notes ? `
                <tr>
                  <td colspan="5" style="background-color: #f9fafb; font-size: 10pt;">
                    ${language === 'ar' ? 'الملاحظات:' : 'Notes:'} ${interaction.notes}
                  </td>
                </tr>
              ` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="print-footer">
        <div>${language === 'ar' ? 'تم إنشاء هذا التقرير بواسطة نظام إدارة العملاء (CRM)' : 'This report was generated by CRM System'}</div>
      </div>
    </div>
  `;
};

const getPrintStyles = () => `
  body { font-family: 'Arial', sans-serif; font-size: 12pt; line-height: 1.4; color: #000; background: white; margin: 0; padding: 20px; }
  .print-container { max-width: none; margin: 0; padding: 0; }
  .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
  .print-title { font-size: 24pt; font-weight: bold; margin-bottom: 10px; }
  .print-date { font-size: 14pt; color: #666; margin-bottom: 5px; }
  .print-section { margin-bottom: 25px; page-break-inside: avoid; }
  .print-section-title { font-size: 18pt; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
  .print-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
  .print-table th { background-color: #f5f5f5; font-weight: bold; }
  .print-footer { margin-top: 30px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
  [dir="rtl"] { direction: rtl; text-align: right; }
  [dir="rtl"] .print-table th, [dir="rtl"] .print-table td { text-align: right; }
  [dir="rtl"] .print-header { text-align: center; }
`;

export default InteractionManagement;