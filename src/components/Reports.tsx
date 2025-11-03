import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, FileText, Printer, Calendar } from 'lucide-react';
import { Customer, Interaction, Deal, Task } from '../types';
import { printReport } from '../utils/printReport';
import { translations, currencies, currenciesEn } from '../utils/translations';

interface ReportsProps {
  customers: Customer[];
  interactions: Interaction[];
  deals: Deal[];
  tasks: Task[];
  currency: string;
  language?: string;
}

const Reports: React.FC<ReportsProps> = ({ customers, interactions, deals, tasks, currency, language = 'ar' }) => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const filterByDateRange = (date: string) => {
    const itemDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    return itemDate >= start && itemDate <= end;
  };

  const filteredCustomers = customers.filter(customer => filterByDateRange(customer.createdAt));
  const filteredInteractions = interactions.filter(interaction => filterByDateRange(interaction.date));
  const filteredDeals = deals.filter(deal => filterByDateRange(deal.createdAt));
  const filteredTasks = tasks.filter(task => filterByDateRange(task.createdAt));
  
  const newCustomersCount = filteredCustomers.length;
  
  const closedDeals = filteredDeals.filter(deal => deal.status === 'مغلق' || deal.status === 'closed');
  const closedDealsValue = closedDeals.reduce((sum, deal) => sum + deal.value, 0);
  
  const expectedValue = filteredDeals
    .filter(deal => deal.status === 'جاري' || deal.status === 'ongoing')
    .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  const completedTasks = filteredTasks.filter(task => task.status === 'مكتمل' || task.status === 'completed').length;

  const interactionsByType = filteredInteractions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const customersByType = filteredCustomers.reduce((acc, customer) => {
    acc[customer.type] = (acc[customer.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  const handlePrintReport = () => {
    printReport(
      filteredCustomers,
      filteredInteractions,
      filteredDeals,
      filteredTasks,
      startDate,
      endDate,
      currency,
      language
    );
  };

  const chartData = [
    { name: t('calls'), value: (interactionsByType['مكالمة'] || 0) + (interactionsByType['call'] || 0), color: 'bg-blue-500' },
    { name: t('meetings'), value: (interactionsByType['مقابلة'] || 0) + (interactionsByType['meeting'] || 0), color: 'bg-green-500' },
    { name: t('emails'), value: (interactionsByType['إيميل'] || 0) + (interactionsByType['email'] || 0), color: 'bg-purple-500' },
    { name: t('messages'), value: (interactionsByType['رسالة'] || 0) + (interactionsByType['message'] || 0), color: 'bg-orange-500' },
  ];

  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('reportsAndStats')}</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <span className="text-gray-600">{t('to')}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={handlePrintReport}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              <Printer className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('printReport')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('newCustomers')}</p>
                <p className="text-3xl font-bold">{newCustomersCount}</p>
                <p className="text-xs opacity-75">{t('inSelectedPeriod')}</p>
              </div>
              <Users className="h-12 w-12 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('totalInteractions')}</p>
                <p className="text-3xl font-bold">{filteredInteractions.length}</p>
                <p className="text-xs opacity-75">{t('inSelectedPeriod')}</p>
              </div>
              <BarChart3 className="h-12 w-12 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('closedDeals')}</p>
                <p className="text-3xl font-bold">{closedDeals.length}</p>
                <p className="text-xs opacity-75">{formatCurrency(closedDealsValue)}</p>
              </div>
              <Target className="h-12 w-12 opacity-75" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('expectedValue')}</p>
                <p className="text-2xl font-bold">{formatCurrency(expectedValue)}</p>
                <p className="text-xs opacity-75">{t('ongoingDeals')}</p>
              </div>
              <TrendingUp className="h-12 w-12 opacity-75" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interactionsByType')}</h3>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                    <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium text-sm w-8 text-left">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('customersByType')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('newCustomersType')}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(customersByType['جديد'] || 0) + (customersByType['new'] || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('potentialCustomers')}</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(customersByType['محتمل'] || 0) + (customersByType['potential'] || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('permanentCustomers')}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(customersByType['دائم'] || 0) + (customersByType['permanent'] || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'} mb-2`}>
              <FileText className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">{t('performanceSummary')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('dealCloseRate')}:</span>
                <span className="font-medium">
                  {deals.length > 0 ? Math.round((closedDeals.length / deals.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('averageDealValue')}:</span>
                <span className="font-medium">
                  {closedDeals.length > 0 ? formatCurrency(closedDealsValue / closedDeals.length) : formatCurrency(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'} mb-2`}>
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">{t('growthTrend')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('newCustomersCount')}:</span>
                <span className="text-green-600 font-medium">+{newCustomersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('interactionsCount')}:</span>
                <span className="text-blue-600 font-medium">+{filteredInteractions.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'} mb-2`}>
              <Target className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">{t('taskStatus')}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('completedTasksCount')}:</span>
                <span className="text-green-600 font-medium">{completedTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('inProgressTasks')}:</span>
                <span className="text-blue-600 font-medium">
                  {filteredTasks.filter(t => t.status === 'جاري' || t.status === 'inProgress').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;