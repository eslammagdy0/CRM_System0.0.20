import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit3, Trash2, Clock, CheckCircle, AlertCircle, Bell, Printer } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [completedTasksStartDate, setCompletedTasksStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10);
  });
  const [completedTasksEndDate, setCompletedTasksEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    description: '',
    dueDate: (() => {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Add 1 hour to current time
      return now.toISOString().slice(0, 16);
    })(),
    priority: (language === 'ar' ? 'متوسط' : 'medium') as const,
    status: (language === 'ar' ? 'قيد الانتظار' : 'pending') as const
  });

  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations['ar']] || key;
  };

  const printTasks = () => {
    const printContent = generateTasksPrintContent(filteredTasks, customers, language, t, completedTasksStartDate, completedTasksEndDate);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${language === 'ar' ? 'ar' : 'en'}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${language === 'ar' ? 'تقرير المهام' : 'Tasks Report'}</title>
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
    const now = new Date();
    now.setHours(now.getHours() + 1); // Add 1 hour to current time
    
    setFormData({
      title: '',
      customerId: '',
      description: '',
      dueDate: now.toISOString().slice(0, 16),
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

  // Filter completed tasks by date range
  const filteredCompletedTasks = tasks.filter(task => {
    const isCompleted = task.status === 'مكتمل' || task.status === 'completed';
    if (!isCompleted) return false;
    
    const taskDate = new Date(task.dueDate).toISOString().slice(0, 10);
    return taskDate >= completedTasksStartDate && taskDate <= completedTasksEndDate;
  });
  const filterTasks = () => {
    if (statusFilter === 'all') {
      return sortedTasks;
    }
    
    // Handle filter matching for both languages
    return sortedTasks.filter(task => {
      return task.status === statusFilter ||
        (language === 'ar' && (
          (statusFilter === 'قيد الانتظار' && task.status === 'pending') ||
          (statusFilter === 'جاري' && task.status === 'inProgress') ||
          (statusFilter === 'مكتمل' && task.status === 'completed')
        )) ||
        (language === 'en' && (
          (statusFilter === 'pending' && task.status === 'قيد الانتظار') ||
          (statusFilter === 'inProgress' && task.status === 'جاري') ||
          (statusFilter === 'completed' && task.status === 'مكتمل')
        ));
    });
  };

  const filteredTasks = filterTasks();
  const pendingTasks = tasks.filter(t => t.status === 'قيد الانتظار' || t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'جاري' || t.status === 'inProgress');
  const completedTasks = tasks.filter(t => t.status === 'مكتمل' || t.status === 'completed');

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
                {completedTasks.length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('tasksManagement')}</h2>
          <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3'}`}>
            <button
              onClick={printTasks}
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
              {t('addNewTask')}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
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
              {language === 'ar' ? 'جميع المهام' : 'All Tasks'} ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'قيد الانتظار' : 'pending')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'قيد الانتظار' : 'pending')
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'ar' ? 'قيد الانتظار' : 'Pending'} ({pendingTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'جاري' : 'inProgress')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'جاري' : 'inProgress')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'ar' ? 'جاري' : 'In Progress'} ({inProgressTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter(language === 'ar' ? 'مكتمل' : 'completed')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                statusFilter === (language === 'ar' ? 'مكتمل' : 'completed')
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'ar' ? 'مكتملة' : 'Completed'} ({completedTasks.length})
            </button>
          </div>
        </div>

        {/* Date Filter for Completed Tasks */}
        {statusFilter === (language === 'ar' ? 'مكتمل' : 'completed') && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              {language === 'ar' ? 'فلترة المهام المكتملة' : 'Filter Completed Tasks'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  {language === 'ar' ? 'من تاريخ' : 'From Date'}
                </label>
                <input
                  type="date"
                  value={completedTasksStartDate}
                  onChange={(e) => setCompletedTasksStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
                </label>
                <input
                  type="date"
                  value={completedTasksEndDate}
                  onChange={(e) => setCompletedTasksEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end sm:col-span-2 xl:col-span-1">
                <div className="text-sm text-green-700">
                  {language === 'ar' ? 'المهام المكتملة:' : 'Completed Tasks:'} {filteredCompletedTasks.length}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {(statusFilter === (language === 'ar' ? 'مكتمل' : 'completed') ? filteredCompletedTasks : filteredTasks).map(task => (
            <div 
              key={task.id} 
              className={`rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                task.status === 'مكتمل' || task.status === 'completed' 
                  ? 'bg-green-50 opacity-75' 
                  : isOverdue(task.dueDate) 
                    ? 'bg-gray-50 border-r-4 border-red-500' 
                    : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={"flex items-start " + (language === 'ar' ? 'space-x-3 space-x-reverse' : 'space-x-3')}>
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className={"font-semibold " + (task.status === 'مكتمل' || task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900')}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600">{getCustomerName(task.customerId)}</p>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                </div>
                
                <div className={"flex items-center " + (language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2')}>
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + getPriorityColor(task.priority)}>
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
                <div className={"flex items-center " + (language === 'ar' ? 'space-x-4 space-x-reverse' : 'space-x-4') + " text-sm text-gray-600"}>
                  <span className={isOverdue(task.dueDate) && task.status !== 'مكتمل' && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                    {t('due')}: {new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                  {isOverdue(task.dueDate) && task.status !== 'مكتمل' && task.status !== 'completed' && (
                    <span className="text-red-600 font-medium">{t('overdue')}</span>
                  )}
                  {(task.status === 'مكتمل' || task.status === 'completed') && (
                    <span className="text-green-600 font-medium">
                      {language === 'ar' ? 'مكتملة' : 'Completed'}
                    </span>
                  )}
                </div>
                
                <div className={"flex items-center " + (language === 'ar' ? 'space-x-2 space-x-reverse' : 'space-x-2')}>
                  <span className={"px-2 py-1 rounded-full text-xs font-medium " + getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={language === 'ar' ? 'قيد الانتظار' : 'pending'}>{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                    <option value={language === 'ar' ? 'جاري' : 'inProgress'}>{language === 'ar' ? 'جاري' : 'In Progress'}</option>
                    <option value={language === 'ar' ? 'مكتمل' : 'completed'}>{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          {(statusFilter === (language === 'ar' ? 'مكتمل' : 'completed') ? filteredCompletedTasks : filteredTasks).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {statusFilter === (language === 'ar' ? 'مكتمل' : 'completed') 
                ? (language === 'ar' ? 'لا توجد مهام مكتملة في الفترة المحددة' : 'No completed tasks found in the selected period')
                : (language === 'ar' ? 'لا توجد مهام' : 'No tasks found')
              }
            </div>
          )}
        </div>
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

const generateTasksPrintContent = (tasks: Task[], customers: Customer[], language: string, t: (key: string) => string, startDate: string, endDate: string) => {
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return language === 'ar' ? 'مهمة عامة' : 'General Task';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || (language === 'ar' ? 'عميل غير معروف' : 'Unknown Customer');
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

  return `
    <div class="print-container" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <div class="print-header">
        <div class="print-title">${language === 'ar' ? 'تقرير المهام' : 'Tasks Report'}</div>
        <div class="print-date">
          ${language === 'ar' ? 'فترة المهام المكتملة:' : 'Completed Tasks Period:'} ${new Date(startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date(endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
        <div class="print-date">
          ${language === 'ar' ? 'تاريخ الإنشاء:' : 'Generated on:'} ${new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - ${new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US')}
        </div>
      </div>
      
      <div class="print-section">
        <div class="print-section-title">${language === 'ar' ? 'قائمة المهام' : 'Tasks List'}</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>${language === 'ar' ? 'عنوان المهمة' : 'Task Title'}</th>
              <th>${language === 'ar' ? 'العميل' : 'Customer'}</th>
              <th>${language === 'ar' ? 'الأولوية' : 'Priority'}</th>
              <th>${language === 'ar' ? 'الحالة' : 'Status'}</th>
              <th>${language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td>${task.title}</td>
                <td>${getCustomerName(task.customerId)}</td>
                <td>${getPriorityLabel(task.priority)}</td>
                <td>${getStatusLabel(task.status)}</td>
                <td>${new Date(task.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</td>
              </tr>
              ${task.description ? `
                <tr>
                  <td colspan="5" style="background-color: #f9fafb; font-size: 10pt;">
                    ${language === 'ar' ? 'الوصف:' : 'Description:'} ${task.description}
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

export default TasksReminders;