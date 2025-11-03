import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, BarChart3, Search, FileDown, FileUp, UserPlus, Target, Phone, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import CustomerManagement from './components/CustomerManagement';
import InteractionManagement from './components/InteractionManagement';
import DealsManagement from './components/DealsManagement';
import TasksReminders from './components/TasksReminders';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import { Customer, Interaction, Deal, Task, Settings } from './types';
import { getThemeClasses } from './utils/themes';
import { translations } from './utils/translations';

function App() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>({
    language: 'ar',
    currency: 'EGP',
    theme: 'default',
    darkMode: false
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('crm-customers');
    const savedInteractions = localStorage.getItem('crm-interactions');
    const savedDeals = localStorage.getItem('crm-deals');
    const savedTasks = localStorage.getItem('crm-tasks');
    const savedSettings = localStorage.getItem('crm-settings');

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedInteractions) setInteractions(JSON.parse(savedInteractions));
    if (savedDeals) setDeals(JSON.parse(savedDeals));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('crm-customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('crm-interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('crm-deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('crm-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('crm-settings', JSON.stringify(settings));
  }, [settings]);

  const exportBackup = () => {
    const backup = {
      customers,
      interactions,
      deals,
      tasks,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          if (backup.customers) setCustomers(backup.customers);
          if (backup.interactions) setInteractions(backup.interactions);
          if (backup.deals) setDeals(backup.deals);
          if (backup.tasks) setTasks(backup.tasks);
          if (backup.settings) setSettings(backup.settings);
          alert('تم استيراد النسخة الاحتياطية بنجاح!');
        } catch (error) {
          alert('خطأ في استيراد النسخة الاحتياطية!');
        }
      };
      reader.readAsText(file);
    }
  };

  const t = (key: string) => {
    return translations[settings.language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const tabs = [
    { id: 'customers', name: settings.language === 'ar' ? 'إدارة العملاء' : 'Customer Management', icon: Users },
    { id: 'interactions', name: settings.language === 'ar' ? 'التفاعلات' : 'Interactions', icon: Phone },
    { id: 'deals', name: settings.language === 'ar' ? 'الصفقات' : 'Deals', icon: Target },
    { id: 'tasks', name: settings.language === 'ar' ? 'المهام والتذكيرات' : 'Tasks & Reminders', icon: Calendar },
    { id: 'reports', name: settings.language === 'ar' ? 'التقارير' : 'Reports', icon: BarChart3 },
    { id: 'settings', name: settings.language === 'ar' ? 'الإعدادات' : 'Settings', icon: SettingsIcon },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomerManagement 
          customers={customers} 
          setCustomers={setCustomers} 
          language={settings.language}
        />;
      case 'interactions':
        return <InteractionManagement 
          interactions={interactions} 
          setInteractions={setInteractions} 
          customers={customers} 
          language={settings.language}
        />;
      case 'deals':
        return <DealsManagement 
          deals={deals} 
          setDeals={setDeals} 
          customers={customers} 
          currency={settings.currency}
          language={settings.language}
        />;
      case 'tasks':
        return <TasksReminders 
          tasks={tasks} 
          setTasks={setTasks} 
          customers={customers} 
          language={settings.language}
        />;
      case 'reports':
        return <Reports 
          customers={customers} 
          interactions={interactions} 
          deals={deals} 
          tasks={tasks} 
          currency={settings.currency}
          language={settings.language}
        />;
      case 'settings':
        return <SettingsComponent 
          settings={settings}
          setSettings={setSettings}
          onExportBackup={exportBackup}
          onImportBackup={importBackup}
          language={settings.language}
        />;
      default:
        return null;
    }
  };

  const themeClasses = getThemeClasses({ primary: settings.theme }, settings.darkMode);

  return (
    <div className={`min-h-screen ${themeClasses.background} ${settings.darkMode ? 'dark' : ''}`} dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
      <header className={`${themeClasses.surface} shadow-lg border-b-4 border-${settings.theme}-600`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className={`flex items-center ${settings.language === 'ar' ? 'space-x-4 space-x-reverse' : 'space-x-4'}`}>
              <div className={`bg-${settings.theme}-600 p-2 rounded-lg`}>
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${themeClasses.text}`}>
                  {settings.language === 'ar' ? 'نظام إدارة العملاء' : 'CRM System'}
                </h1>
                <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {settings.language === 'ar' ? 'CRM System' : 'Customer Relationship Management'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className={`${themeClasses.surface} shadow-sm border-b ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className={`hidden md:flex ${settings.language === 'ar' ? 'space-x-8 space-x-reverse' : 'space-x-8'}`}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `border-${settings.theme}-600 text-${settings.theme}-600`
                      : `border-transparent ${settings.darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${settings.language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {settings.language === 'ar' ? tab.name : getEnglishTabName(tab.id)}
                </button>
              );
            })}
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between w-full py-4">
            <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
              {tabs.find(tab => tab.id === activeTab)?.name || 
               (settings.language === 'ar' ? tabs.find(tab => tab.id === activeTab)?.name : getEnglishTabName(activeTab))}
            </h3>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${settings.darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
              <div className="px-4 py-2 space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? `bg-${settings.theme}-50 text-${settings.theme}-600`
                          : `text-gray-700 hover:bg-gray-50`
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${settings.language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                      {settings.language === 'ar' ? tab.name : getEnglishTabName(tab.id)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );

  function getEnglishTabName(tabId: string): string {
    const englishNames: Record<string, string> = {
      customers: 'Customers',
      interactions: 'Interactions', 
      deals: 'Deals',
      tasks: 'Tasks',
      reports: 'Reports',
      settings: 'Settings'
    };
    return englishNames[tabId] || tabId;
  }
}

export default App;