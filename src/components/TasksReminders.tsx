import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { Task, Customer } from '../types';
import { translations } from '../utils/translations';

interface TasksRemindersProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  customers: Customer[];
  language: string;
}

const TasksReminders: React.FC<TasksRemindersProps> = ({ 
  tasks, 
  setTasks, 
  customers,
  language
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState<Task[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 16),
    priority: (language === 'ar' ? 'متوسط' : 'medium') as const,
    status: (language === 'ar' ? 'قيد الانتظار' : 'pending') as const
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  // Check for due tasks every minute
  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      const dueTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        const timeDiff = taskDate.getTime() - now.getTime();
        return timeDiff > 0 && timeDiff <= 60 * 60 * 1000 && task.status !== 'مكتمل' && task.status !== 'completed'; // Within 1 hour
      });
      
      setNotifications(dueTasks);
    };

    checkDueTasks();
    const interval = setInterval(checkDueTasks, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to match current language
    const processedFormData = {
      ...formData,
      priority: language === 'ar' ? 
        (formData.priority === 'high' ? 'عالي' : 
         formData.priority === 'medium' ? 'متوسط' : 
         formData.priority === 'low' ? 'منخفض' : formData.priority) : 
        (formData.priority === 'عالي' ? 'high' : 
         formData.priority === 'متوسط' ? 'medium' : 
         formData.priority === 'منخفض' ? 'low' : formData.priority),
      status: language === 'ar' ? 
        (formData.status === 'pending' ? 'قيد الانتظار' : 
         formData.status === 'inProgress' ? 'جاري' : 
         formData.status === 'completed' ? 'مكتمل' : formData.status) : 
        (formData.status === 'قيد الانتظار' ? 'pending' : 
         formData.status === 'جاري' ? 'inProgress' : 
         formData.status === 'مكتمل' ? 'completed' : formData.status)
    };

    const taskData: Task = {
      id: editingTask?.id || Date.now().toString(),
      ...processedFormData,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
    };

    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? taskData : task
      ));
    } else {
      setTasks(prev => [...prev, taskData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      customerId: '',
      description: '',
      dueDate: new Date().toISOString().slice(0, 16),
      priority: language === 'ar' ? 'متوسط' : 'medium',
      status: language === 'ar' ? 'قيد الانتظار' : 'pending'
    });
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    // Convert task data to match current language for editing
    const convertedPriority = language === 'ar' ? 
      (task.priority === 'high' ? 'عالي' : 
       task.priority === 'medium' ? 'متوسط' : 
       task.priority === 'low' ? 'منخفض' : task.priority) : 
      (task.priority === 'عالي' ? 'high' : 
       task.priority === 'متوسط' ? 'medium' : 
       task.priority === 'منخفض' ? 'low' : task.priority);

    const convertedStatus = language === 'ar' ? 
      (task.status === 'pending' ? 'قيد الانتظار' : 
       task.status === 'inProgress' ? 'جاري' : 
       task.status === 'completed' ? 'مكتمل' : task.status) : 
      (task.status === 'قيد الانتظار' ? 'pending' : 
       task.status === 'جاري' ? 'inProgress' : 
       task.status === 'مكتمل' ? 'completed' : task.status);

    setFormData({
      title: task.title,
      customerId: task.customerId || '',
      description: task.description,
      dueDate: task.dueDate,
      priority: convertedPriority,
      status: convertedStatus
    });
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDeleteTask'))) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    // Convert status to match current language
    const convertedStatus = language === 'ar' ? 
      (newStatus === 'pending' ? 'قيد الانتظار' : 
       newStatus === 'inProgress' ? 'جاري' : 
       newStatus === 'completed' ? 'مكتمل' : newStatus) : 
      (newStatus === 'قيد الانتظار' ? 'pending' : 
       newStatus === 'جاري' ? 'inProgress' : 
       newStatus === 'مكتمل' ? 'completed' : newStatus);

    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: convertedStatus } : task
    ));
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return t('generalTask');
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || t('unknownCustomer');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالي': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'متوسط': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'منخفض': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    if (language === 'ar') {
      switch (priority) {
        case 'high': return 'عالي';
        case 'medium': return 'متوسط';
        case 'low': return 'منخفض';
        default: return priority;
      }
    } else {
      switch (priority) {
        case 'عالي': return 'High';
        case 'متوسط': return 'Medium';
        case 'منخفض': return 'Low';
        default: return priority;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد الانتظار': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'جاري': return 'bg-blue-100 text-blue-800';
      case 'inProgress': return 'bg-blue-100 text-blue-800';
      case 'مكتمل': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    if (language === 'ar') {
      switch (status) {
        case 'pending': return 'قيد الانتظار';
        case 'inProgress': return 'جاري';
        case 'completed': return 'مكتمل';
        default: return status;
      }
    } else {
      switch (status) {
        case 'قيد الانتظار': return 'Pending';
        case 'جاري': return 'In Progress';
        case 'مكتمل': return 'Completed';
        default: return status;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'قيد الانتظار': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'جاري': return <AlertCircle className="h-4 w-4" />;
      case 'inProgress': return <AlertCircle className="h-4 w-4" />;
      case 'مكتمل': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks last, then overdue tasks first
    const aCompleted = a.status === 'مكتمل' || a.status === 'completed';
    const bCompleted = b.status === 'مكتمل' || b.status === 'completed';
    
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    
    // If both completed or both not completed, sort by overdue status
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    
    if (!aCompleted && !bCompleted) {
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
    }
    
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const overdueTasks = tasks.filter(task => isOverdue(task.dueDate) && task.status !== 'مكتمل' && task.status !== 'completed');
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString() && task.status !== 'مكتمل' && task.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Bell className={`h-5 w-5 text-yellow-600 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            <h3 className="text-lg font-semibold text-yellow-800">{t('taskNotifications')}</h3>
          </div>
          <div className="space-y-2">
            {notifications.map(task => (
              <div key={task.id} className="text-sm text-yellow-700">
                <strong>{task.title}</strong> - {t('dueTime')}: {new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('overdueTasks')}</p>
              <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('todayTasks')}</p>
              <p className="text-2xl font-bold text-blue-600">{todayTasks.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('completedTasks')}</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'مكتمل' || t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('tasksManagement')}</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {t('addNewTask')}
          </button>
        </div>

        <div className="space-y-4">
          {/* Active Tasks */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'المهام النشطة' : 'Active Tasks'}
            </h3>
            {sortedTasks.filter(task => task.status !== 'مكتمل' && task.status !== 'completed').map(task => (
              <div 
                key={task.id} 
                className={`bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                  isOverdue(task.dueDate) ? 'border-r-4 border-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`flex items-start ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">{getCustomerName(task.customerId)}</p>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pr-11">
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-4 space-x-reverse' : 'space-x-4'} text-sm text-gray-600`}>
                    <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                      {t('due')}: {new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                    {isOverdue(task.dueDate) && (
                      <span className="text-red-600 font-medium">{t('overdue')}</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={language === 'ar' ? 'قيد الانتظار' : 'pending'}>{t('pending')}</option>
                      <option value={language === 'ar' ? 'جاري' : 'inProgress'}>{t('inProgress')}</option>
                      <option value={language === 'ar' ? 'مكتمل' : 'completed'}>{t('completed')}</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            {sortedTasks.filter(task => task.status !== 'مكتمل' && task.status !== 'completed').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                {language === 'ar' ? 'لا توجد مهام نشطة' : 'No active tasks'}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {sortedTasks.filter(task => task.status === 'مكتمل' || task.status === 'completed').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}
              </h3>
              {sortedTasks.filter(task => task.status === 'مكتمل' || task.status === 'completed').map(task => (
            <div 
              key={task.id} 
              className="bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 opacity-75"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`flex items-start ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold line-through text-gray-500">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600">{getCustomerName(task.customerId)}</p>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                </div>
                
                <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pr-11">
                <div className={`flex items-center ${language === 'ar' ? 'space-x-4 space-x-reverse' : 'space-x-4'} text-sm text-gray-600`}>
                  <span>
                    {t('due')}: {new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                  <span className="text-green-600 font-medium">
                    {language === 'ar' ? 'مكتملة' : 'Completed'}
                  </span>
                </div>
                
                <div className={`flex items-center ${language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={language === 'ar' ? 'قيد الانتظار' : 'pending'}>{t('pending')}</option>
                    <option value={language === 'ar' ? 'جاري' : 'inProgress'}>{t('inProgress')}</option>
                    <option value={language === 'ar' ? 'مكتمل' : 'completed'}>{t('completed')}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('noTasksRecorded')}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? t('editTask') : t('addNewTask')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('taskTitle')}</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customer')} ({language === 'ar' ? 'اختياري' : 'Optional'})</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('generalTask')}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('taskDescription')}</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dueDate')}</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('priority')}</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'عالي' : 'high'}>{t('high')}</option>
                  <option value={language === 'ar' ? 'متوسط' : 'medium'}>{t('medium')}</option>
                  <option value={language === 'ar' ? 'منخفض' : 'low'}>{t('low')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={language === 'ar' ? 'قيد الانتظار' : 'pending'}>{t('pending')}</option>
                  <option value={language === 'ar' ? 'جاري' : 'inProgress'}>{t('inProgress')}</option>
                  <option value={language === 'ar' ? 'مكتمل' : 'completed'}>{t('completed')}</option>
                </select>
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
                  {editingTask ? t('update') : t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksReminders;