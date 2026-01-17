import React from 'react';
import { format, isPast, startOfDay } from 'date-fns';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    Todo: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
  };

  // Check if task is overdue (due date passed and not completed)
  const isOverdue = task.dueDate && 
    task.status !== 'Completed' && 
    isPast(startOfDay(new Date(task.dueDate))) &&
    startOfDay(new Date(task.dueDate)) < startOfDay(new Date());

  const handleStatusChange = (e) => {
    onStatusChange(task._id, e.target.value);
  };

  return (
    <div className={`card hover:shadow-lg transition-shadow ${isOverdue ? 'bg-red-50 border-red-200' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>

      {task.dueDate && (
        <div className={`text-sm mb-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <span className="text-xs text-gray-400">
          {format(new Date(task.createdAt), 'MMM dd, yyyy')}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
