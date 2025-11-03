import React, { useState } from 'react';
import { Plus, CreditCard as Edit3, Trash2, DollarSign, TrendingUp, Printer } from 'lucide-react';
import { Deal, Customer } from '../types';
import { translations, currencies, currenciesEn } from '../utils/translations';

interface DealsManagementProps {
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  customers: Customer[];
  currency: string;
  language: string;
}

const DealsManagement: React.FC<DealsManagementProps> = ({ 
  deals, 
  setDeals, 
  customers,
  currency,
  language
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRejectionReasonsManager, setShowRejectionReasonsManager] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm-rejection-reasons');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    value: 0,
    status: (language === 'ar' ? 'جاري' : 'ongoing') as const,
    probability: 50,
    expectedCloseDate: new Date().toISOString().slice(0, 10), // Current date
    notes: '',
    rejectionReason: ''
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const printDeals = () => {
    const printContent = generateDealsPrintContent(filteredDeals, customers, currency, language, t);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${language === 'ar' ? 'تقرير الصفقات' : 'Deals Report'}</title>
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
      status: language === 'ar' ? 
        (formData.status === 'ongoing' ? 'جاري' : 
         formData.status === 'closed' ? 'مغلق' : 
         formData.status === 'rejected' ? 'مرفوض' : formData.status) : 
        (formData.status === 'جاري' ? 'ongoing' : 
         formData.status === 'مغلق' ? 'closed' : 
         formData.status === 'مرفوض' ? 'rejected' : formData.status)
    };

    const dealData: Deal = {
      id: editingDeal?.id || Date.now().toString(),
      ...processedFormData,
      createdAt: editingDeal?.createdAt || new Date().toISOString(),
    };

    if (editingDeal) {
      setDeals(prev => prev.map(deal => 
        deal.id === editingDeal.id ? dealData : deal
      ));
    } else {
      setDeals(prev => [...prev, dealData]);
    }

    // Save rejection reason if it's new
    if (processedFormData.rejectionReason && !rejectionReasons.includes(processedFormData.rejectionReason)) {
      const newReasons = [...rejectionReasons, processedFormData.rejectionReason];
      setRejectionReasons(newReasons);
      localStorage.setItem('crm-rejection-reasons', JSON.stringify(newReasons));
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      customerId: '',
      value: 0,
      status: language === 'ar' ? 'جاري' : 'ongoing',
      probability: 50,
      expectedCloseDate: new Date().toISOString().slice(0, 10), // Reset to current date
      notes: '',
      rejectionReason: ''
    });
    setShowForm(false);
    setEditingDeal(null);
  };

  const handleEdit = (deal: Deal) => {
    // Convert deal data to match current language for editing
    const convertedStatus = language === 'ar' ? 
      (deal.status === 'ongoing' ? 'جاري' : 
       deal.status === 'closed' ? 'مغلق' : 
       deal.status === 'rejected' ? 'مرفوض' : deal.status) : 
      (deal.status === 'جاري' ? 'ongoing' : 
       deal.status === 'مغلق' ? 'closed' : 
       deal.status === 'مرفوض' ? 'rejected' : deal.status);

    setFormData({
      title: deal.title,
      customerId: deal.customerId,
      value: deal.value,
      status: convertedStatus,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      notes: deal.notes || '',
      rejectionReason: deal.rejectionReason || ''
    });
    setEditingDeal(deal);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDeleteDeal'))) {
      setDeals(prev => prev.filter(deal => deal.id !== id));
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || t('unknownCustomer');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جاري': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'مغلق': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'مرفوض': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'ar') {
      switch (status) {
        case 'ongoing': return 'جاري';
        case 'closed': return 'مغلق';
        case 'rejected': return 'مرفوض';
        default: return status;
      }
    } else {
      switch (status) {
        case 'جاري': return 'Ongoing';
        case 'مغلق': return 'Closed';
        case 'مرفوض': return 'Rejected';
        default: return status;
      }
    }
  };

  const getTotalValue = () => {
    return deals
      .filter(deal => deal.status === 'جاري' || deal.status === 'ongoing')
      .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
  };

  const formatCurrency = (amount: number) => {
    const currencyMap = {
      EGP: { locale: 'ar-EG', currency: 'EGP' },
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      SAR: { locale: 'ar-SA', currency: 'SAR' },
      AED: { locale: 'ar-AE', currency: 'AED' }
    };
    
    const config = currencyMap[currency as keyof typeof currencyMap] || currencyMap.EGP;
    
    // استخدام تنسيق مخصص للعملات العربية
    if (language === 'ar') {
      const currencyInfo = currencies[currency as keyof typeof currencies] || currencies.EGP;
      return `${amount.toLocaleString('ar-EG')} ${currencyInfo.symbol}`;
    } else {
      const currencyInfo = currenciesEn[currency as keyof typeof currenciesEn] || currenciesEn.EGP;
      if (currency === 'USD' || currency === 'EUR') {
        return new Intl.NumberFormat(config.locale, {
          style: 'currency',
          currency: config.currency
        }).format(amount);
      } else {
        return `${currencyInfo.symbol} ${amount.toLocaleString('en-US')}`;
      }
    }
  };

  const getCurrencyLabel = () => {
    if (language === 'ar') {
      const currencyInfo = currencies[currency as keyof typeof currencies] || currencies.EGP;
      return currencyInfo.name;
    } else {
      const currencyInfo = currenciesEn[currency as keyof typeof currenciesEn] || currenciesEn.EGP;
      return currencyInfo.name;
    }
  };

  const filterDeals = () => {
    if (statusFilter === 'all') {
      return deals;
    }
    
    // Handle filter matching for both languages
    return deals.filter(deal => {
      return deal.status === statusFilter ||
        (language === 'ar' && (
          (statusFilter === 'جاري' && deal.status === 'ongoing') ||
          (statusFilter === 'مغلق' && deal.status === 'closed') ||
          (statusFilter === 'مرفوض' && deal.status === 'rejected')
        )) ||
        (language === 'en' && (
          (statusFilter === 'ongoing' && deal.status === 'جاري') ||
          (statusFilter === 'closed' && deal.status === 'مغلق') ||
          (statusFilter === 'rejected' && deal.status === 'مرفوض')
        ));
    });
  };

  const filteredDeals = filterDeals();
  const ongoingDeals = deals.filter(d => d.status === 'جاري' || d.status === 'ongoing');
  const closedDeals = deals.filter(d => d.status === 'مغلق' || d.status === 'closed');
  const rejectedDeals = deals.filter(d => d.status === 'مرفوض' || d.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalOngoingDeals')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {ongoingDeals.length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('expectedValue')}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalValue())}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('closedDeals')}</p>
              <p className="text-2xl font-bold text-purple-600">
                {closedDeals.length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('dealsManagement')}</h2>
          <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
          <div className={"flex flex-wrap gap-2 " + (language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3')}>
            <button
              onClick={printDeals}
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
              {t('addNewDeal')}
            </button>
            <button
              onClick={() => setShowRejectionReasonsManager(true)}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              {language === 'ar' ? 'إدارة أسباب الرفض' : 'Manage Rejection Reasons'}
            </button>
          </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'ar' ? 'جميع الصفقات' : 'All Deals'} ({deals.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'جاري' : 'ongoing')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'جاري' : 'ongoing')
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('ongoing')} ({ongoingDeals.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'مغلق' : 'closed')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'مغلق' : 'closed')
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('closed')} ({closedDeals.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'مرفوض' : 'rejected')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'مرفوض' : 'rejected')
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('rejected')} ({rejectedDeals.length})
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map(deal => (
            <div key={deal.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                  <p className="text-gray-600 text-sm">{getCustomerName(deal.customerId)}</p>
                </div>
                <div className={`flex ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <div className={"flex " + (language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2')}>
                  <button
                    onClick={() => handleEdit(deal)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(deal.value)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                    {getStatusLabel(deal.status)}
                  </span>
                </div>

                {(deal.status === 'جاري' || deal.status === 'ongoing') && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{t('successProbability')}</span>
                      <span>{deal.probability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${deal.probability}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {t('expectedCloseDate')}: {new Date(deal.expectedCloseDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </p>

                {deal.notes && (
                  <p className="text-xs text-gray-600 mt-2">{deal.notes}</p>
                )}

                {deal.rejectionReason && (deal.status === 'مرفوض' || deal.status === 'rejected') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                    <p className="text-xs text-red-800">
                      <strong>{language === 'ar' ? 'سبب الرفض:' : 'Rejection Reason:'}</strong> {deal.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {deals.length === 0 ? t('noDealsRecorded') : (language === 'ar' ? 'لا توجد صفقات بالحالة المحددة' : 'No deals found with the selected status')}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingDeal ? t('editDeal') : t('addNewDeal')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dealName')}</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dealValue')} ({getCurrencyLabel()})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dealStatus')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'جاري' : 'ongoing'}>{t('ongoing')}</option>
                  <option value={language === 'ar' ? 'مغلق' : 'closed'}>{t('closed')}</option>
                  <option value={language === 'ar' ? 'مرفوض' : 'rejected'}>{t('rejected')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('successProbability')} ({formData.probability}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.probability}
                  onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('expectedCloseDate')}</label>
                <input
                  type="date"
                  required
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {(formData.status === 'مرفوض' || formData.status === 'rejected') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}
                  </label>
                  <input
                    type="text"
                    list="rejection-reasons"
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={language === 'ar' ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                  />
                  <datalist id="rejection-reasons">
                    {rejectionReasons.map(reason => <option key={reason} value={reason} />)}
                  </datalist>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className={`flex justify-end ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'} pt-4`}>
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
                  {editingDeal ? t('update') : t('add')}
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const generateDealsPrintContent = (deals: Deal[], customers: Customer[], currency: string, language: string, t: (key: string) => string) => {
  // Get rejection reasons from localStorage
  const rejectionReasons = (() => {
    const saved = localStorage.getItem('crm-rejection-reasons');
    return saved ? JSON.parse(saved) : [];
  })();

  // Count rejected deals by reason
  const rejectionStats = rejectionReasons.reduce((acc: Record<string, number>, reason: string) => {
    acc[reason] = deals.filter(deal => 
      (deal.status === 'مرفوض' || deal.status === 'rejected') && 
      deal.rejectionReason === reason
    ).length;
    return acc;
  }, {});

  const formatCurrency = (amount: number) => {
    if (language === 'ar') {
      const symbols = { EGP: 'ج.م', USD: '$', EUR: '€', SAR: 'ر.س', AED: 'د.إ' };
      return `${amount.toLocaleString('ar-EG')} ${symbols[currency as keyof typeof symbols] || 'ج.م'}`;
    } else {
      const symbols = { EGP: 'EGP', USD: '$', EUR: '€', SAR: 'SAR', AED: 'AED' };
      return `${symbols[currency as keyof typeof symbols] || 'EGP'} ${amount.toLocaleString('en-US')}`;
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || (language === 'ar' ? 'عميل غير معروف' : 'Unknown Customer');
  };

  const getStatusLabel = (status: string) => {
    if (language === 'ar') {
      switch (status) {
        case 'ongoing': return 'جاري';
        case 'closed': return 'مغلق';
        case 'rejected': return 'مرفوض';
        default: return status;
      }
    } else {
      switch (status) {
        case 'جاري': return 'Ongoing';
        case 'مغلق': return 'Closed';
        case 'مرفوض': return 'Rejected';
        default: return status;
      }
    }
  };

  return `
    <div class="print-container" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <div class="print-header">
        <div class="print-title">${language === 'ar' ? 'تقرير الصفقات' : 'Deals Report'}</div>
        <div class="print-date">
          ${language === 'ar' ? 'تاريخ الإنشاء:' : 'Generated on:'} ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'قائمة الصفقات' : 'Deals List'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'اسم الصفقة' : 'Deal Name'}</th>
              <th>${language === 'ar' ? 'العميل' : 'Customer'}</th>
              <th>${language === 'ar' ? 'القيمة' : 'Value'}</th>
              <th>${language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th>${language === 'ar' ? 'تاريخ الإغلاق المتوقع' : 'Expected Close Date'}</th>
            </tr>
          </thead>
          <tbody>
            ${deals.map(deal => `
              <tr>
                <td>${deal.title}</td>
                <td>${getCustomerName(deal.customerId)}</td>
                <td>${formatCurrency(deal.value)}</td>
                <td>${getStatusLabel(deal.status)}</td>
                <td>${new Date(deal.expectedCloseDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
              </tr>
              ${deal.rejectionReason && (deal.status === 'مرفوض' || deal.status === 'rejected') ? `
                <tr>
                  <td colspan="5" style="background-color: #fef2f2; color: #991b1b; font-size: 10pt;">
                    ${language === 'ar' ? 'سبب الرفض:' : 'Rejection Reason:'} ${deal.rejectionReason}
                  </td>
                </tr>
              ` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
      
      ${rejectionReasons.length > 0 ? `
        <div class="print-section">
          <div class="print-section-title">${language === 'ar' ? 'إحصائيات أسباب الرفض' : 'Rejection Reasons Statistics'}</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>${language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}</th>
                <th>${language === 'ar' ? 'عدد الصفقات المرفوضة' : 'Number of Rejected Deals'}</th>
              </tr>
            </thead>
            <tbody>
              ${rejectionReasons.map((reason: string) => `
                <tr>
                  <td>${reason}</td>
                  <td>${rejectionStats[reason] || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
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

export default DealsManagement;