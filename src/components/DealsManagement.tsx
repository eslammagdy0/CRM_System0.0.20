import React, { useState } from 'react';
import { Plus, Edit3, Trash2, DollarSign, TrendingUp } from 'lucide-react';
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
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    value: 0,
    status: (language === 'ar' ? 'جاري' : 'ongoing') as const,
    probability: 50,
    expectedCloseDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
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

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      customerId: '',
      value: 0,
      status: language === 'ar' ? 'جاري' : 'ongoing',
      probability: 50,
      expectedCloseDate: new Date().toISOString().slice(0, 10),
      notes: ''
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
      notes: deal.notes || ''
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('totalOngoingDeals')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {deals.filter(d => d.status === 'جاري' || d.status === 'ongoing').length}
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
                {deals.filter(d => d.status === 'مغلق' || d.status === 'closed').length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('dealsManagement')}</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {t('addNewDeal')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map(deal => (
            <div key={deal.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                  <p className="text-gray-600 text-sm">{getCustomerName(deal.customerId)}</p>
                </div>
                <div className={`flex ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
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
              </div>
            </div>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('noDealsRecorded')}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsManagement;