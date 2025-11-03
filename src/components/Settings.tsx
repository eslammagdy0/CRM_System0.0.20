import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Palette, Moon, Sun, Globe, DollarSign, Sliders, Trash2 } from 'lucide-react';
import { Settings, Theme, Language, Currency } from '../types';
import { themes } from '../utils/themes';
import { translations, currencies, currenciesEn } from '../utils/translations';

interface SettingsProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  language: string;
}

export default function SettingsComponent({ settings, setSettings, onExportBackup, onImportBackup, language }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'customize' | 'backup'>('general');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [tempSettings, setTempSettings] = useState<Settings>(settings);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm-rejection-reasons');
    return saved ? JSON.parse(saved) : [];
  });
  const [newRejectionReason, setNewRejectionReason] = useState('');

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const handleSaveSettings = () => {
    try {
      setSettings(tempSettings);
      localStorage.setItem('crm-settings', JSON.stringify(tempSettings));
      setNotification({
        type: 'success',
        message: language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings saved successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: language === 'ar' ? 'خطأ في حفظ الإعدادات!' : 'Error saving settings!'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Reset temp settings when actual settings change (e.g., on app load)
  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const tabs = [
    { id: 'general', label: language === 'ar' ? 'عام' : 'General', icon: SettingsIcon },
    { id: 'appearance', label: language === 'ar' ? 'المظهر' : 'Appearance', icon: Palette },
    { id: 'customize', label: language === 'ar' ? 'تخصيص' : 'Customize', icon: Sliders },
    { id: 'backup', label: language === 'ar' ? 'النسخ الاحتياطية' : 'Backup', icon: Download }
  ];

  const updateRejectionReasons = (newReasons: string[]) => {
    setRejectionReasons(newReasons);
    localStorage.setItem('crm-rejection-reasons', JSON.stringify(newReasons));
  };

  const addRejectionReason = () => {
    if (newRejectionReason.trim() && !rejectionReasons.includes(newRejectionReason.trim())) {
      const newReasons = [...rejectionReasons, newRejectionReason.trim()];
      updateRejectionReasons(newReasons);
      setNewRejectionReason('');
    }
  };

  const deleteRejectionReason = (reasonToDelete: string) => {
    const newReasons = rejectionReasons.filter(reason => reason !== reasonToDelete);
    updateRejectionReasons(newReasons);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" dir="rtl">
      {notification && (
        <div className={`mb-4 p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'اللغة' : 'Language'}
            </label>
            <select
              value={tempSettings.language}
              onChange={(e) => setTempSettings({ ...tempSettings, language: e.target.value as Language })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              {language === 'ar' ? 'العملة' : 'Currency'}
            </label>
            <select
              value={tempSettings.currency}
              onChange={(e) => setTempSettings({ ...tempSettings, currency: e.target.value as Currency })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="EGP">{language === 'ar' ? 'جنيه مصري (EGP)' : 'Egyptian Pound (EGP)'}</option>
              <option value="USD">{language === 'ar' ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}</option>
              <option value="EUR">{language === 'ar' ? 'يورو (EUR)' : 'Euro (EUR)'}</option>
              <option value="SAR">{language === 'ar' ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)'}</option>
              <option value="AED">{language === 'ar' ? 'درهم إماراتي (AED)' : 'UAE Dirham (AED)'}</option>
            </select>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Palette className="w-4 h-4" />
              {language === 'ar' ? 'المظهر' : 'Theme'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themes).map(([themeKey, themeColors]) => (
                <button
                  key={themeKey}
                  onClick={() => setTempSettings({ ...tempSettings, theme: themeKey as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tempSettings.theme === themeKey
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: `rgb(${themeKey === 'default' ? '37 99 235' : themeKey === 'green' ? '34 197 94' : themeKey === 'purple' ? '147 51 234' : '249 115 22'})` }}
                    ></div>
                    <span className="font-medium text-gray-700">
                      {themeColors.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {tempSettings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}
              </span>
              <button
                onClick={() => setTempSettings({ ...tempSettings, darkMode: !tempSettings.darkMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  tempSettings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    tempSettings.darkMode 
                      ? (tempSettings.language === 'ar' ? 'translate-x-1' : 'translate-x-6')
                      : (tempSettings.language === 'ar' ? 'translate-x-6' : 'translate-x-1')
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Customize Settings */}
      {activeTab === 'customize' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              {language === 'ar' ? 'إدارة أسباب الرفض' : 'Manage Rejection Reasons'}
            </h3>
            <p className="text-sm text-blue-600">
              {language === 'ar' 
                ? 'يمكنك إضافة وإدارة أسباب رفض الصفقات التي ستظهر في قائمة منسدلة عند رفض صفقة.'
                : 'You can add and manage deal rejection reasons that will appear in a dropdown when rejecting a deal.'
              }
            </p>
          </div>

          {/* Add new reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'إضافة سبب رفض جديد' : 'Add New Rejection Reason'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRejectionReason}
                onChange={(e) => setNewRejectionReason(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addRejectionReason();
                  }
                }}
              />
              <button
                onClick={addRejectionReason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>

          {/* List of existing reasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'أسباب الرفض الحالية' : 'Current Rejection Reasons'}
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rejectionReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-800">{reason}</span>
                  <button
                    onClick={() => deleteRejectionReason(reason)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title={language === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {rejectionReasons.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  {language === 'ar' ? 'لا توجد أسباب رفض محفوظة' : 'No rejection reasons saved'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">
              {language === 'ar' ? 'معلومات النسخ الاحتياطية' : 'Backup Information'}
            </h3>
            <p className="text-sm text-blue-600">
              {language === 'ar' 
                ? 'يمكنك تصدير جميع بياناتك كملف JSON واستيرادها لاحقاً لاستعادة البيانات.'
                : 'You can export all your data as a JSON file and import it later to restore data.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Backup */}
            <button
              onClick={onExportBackup}
              className="flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              {language === 'ar' ? 'تصدير نسخة احتياطية' : 'Export Backup'}
            </button>

            {/* Import Backup */}
            <label className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              {language === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup'}
              <input
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}