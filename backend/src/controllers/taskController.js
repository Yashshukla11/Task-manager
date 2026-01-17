import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array().map((e) => e.msg)
        }
      });
    }

    const { title, description, priority, status, dueDate } = req.body;

    const task = new Task({
      userId: req.userId,
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'Todo',
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    await task.save();

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter
    const filter = { userId: req.userId };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.userId });

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errors.array().map((e) => e.msg)
        }
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Don't allow userId to be changed
    delete updates.userId;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });

    if (!task) {
      return res.status(404).json({
        error: {
          message: 'Task not found',
          code: 'TASK_NOT_FOUND'
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
