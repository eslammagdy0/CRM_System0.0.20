import React, { useState } from 'react';
import { UserPlus, Edit3, Trash2, Search, Filter, Tag } from 'lucide-react';
import { Customer } from '../types';
import { translations } from '../utils/translations';

interface CustomerManagementProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  language: string;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, setCustomers, language }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>(language === 'ar' ? 'الكل' : 'All');
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: (language === 'ar' ? 'جديد' : 'new') as const,
    tags: [] as string[],
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
      type: language === 'ar' ? 
        (formData.type === 'new' ? 'جديد' : 
         formData.type === 'potential' ? 'محتمل' : 
         formData.type === 'permanent' ? 'دائم' : formData.type) : 
        (formData.type === 'جديد' ? 'new' : 
         formData.type === 'محتمل' ? 'potential' : 
         formData.type === 'دائم' ? 'permanent' : formData.type)
    };

    const customerData: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      ...processedFormData,
      createdAt: editingCustomer?.createdAt || new Date().toISOString(),
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(customer => 
        customer.id === editingCustomer.id ? customerData : customer
      ));
    } else {
      setCustomers(prev => [...prev, customerData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      type: language === 'ar' ? 'جديد' : 'new',
      tags: [],
      notes: ''
    });
    setNewTag('');
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    // Convert customer data to match current language for editing
    const convertedType = language === 'ar' ? 
      (customer.type === 'new' ? 'جديد' : 
       customer.type === 'potential' ? 'محتمل' : 
       customer.type === 'permanent' ? 'دائم' : customer.type) : 
      (customer.type === 'جديد' ? 'new' : 
       customer.type === 'محتمل' ? 'potential' : 
       customer.type === 'دائم' ? 'permanent' : customer.type);

    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      type: convertedType,
      tags: customer.tags,
      notes: customer.notes || ''
    });
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this customer?')) {
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterType === (language === 'ar' ? 'الكل' : 'All') || customer.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'جديد':
      case 'new': return 'bg-green-100 text-green-800';
      case 'محتمل':
      case 'potential': return 'bg-yellow-100 text-yellow-800';
      case 'دائم':
      case 'permanent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    if (language === 'ar') {
      switch (type) {
        case 'new': return 'جديد';
        case 'potential': return 'محتمل';
        case 'permanent': return 'دائم';
        default: return type;
      }
    } else {
      switch (type) {
        case 'جديد': return 'New';
        case 'محتمل': return 'Potential';
        case 'دائم': return 'Permanent';
        default: return type;
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('customerManagement')}</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <UserPlus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {t('addNewCustomer')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-gray-400`} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value={language === 'ar' ? 'الكل' : 'All'}>{t('allCustomers')}</option>
              <option value={language === 'ar' ? 'جديد' : 'new'}>{t('new')}</option>
              <option value={language === 'ar' ? 'محتمل' : 'potential'}>{t('potential')}</option>
              <option value={language === 'ar' ? 'دائم' : 'permanent'}>{t('permanent')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-gray-600">{customer.phone}</p>
                  {customer.email && <p className="text-gray-600 text-sm">{customer.email}</p>}
                </div>
                <div className={`flex ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(customer.type)}`}>
                  {getTypeLabel(customer.type)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(customer.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {customer.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {customer.notes && (
                <p className="text-xs text-gray-600 mt-2">{customer.notes}</p>
              )}
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {language === 'ar' ? 'لا توجد عملاء مطابقين للبحث' : 'No customers match the search criteria'}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? t('editCustomer') : t('addCustomer')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerType')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'جديد' : 'new'}>{t('new')}</option>
                  <option value={language === 'ar' ? 'محتمل' : 'potential'}>{t('potential')}</option>
                  <option value={language === 'ar' ? 'دائم' : 'permanent'}>{t('permanent')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tags')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t('addTag')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={`${language === 'ar' ? 'mr-1' : 'ml-1'} text-blue-600 hover:text-blue-800`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                  {editingCustomer ? t('update') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;