const Task = require("../models/Task");

// @route   POST /api/v1/tasks
// @desc    Create a new task
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignee } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      createdBy: req.user._id // auto-set from logged-in user
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task"
    });
  }
};

// @route   GET /api/v1/tasks
// @desc    Get all tasks (user sees own, admin sees all)
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    // Base query
    let query = {};

    // If not admin, show only own tasks
    if (req.user.role !== "admin") {
      query.createdBy = req.user._id;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks"
    });
  }
};

// @route   GET /api/v1/tasks/:id
// @desc    Get single task
// @access  Private (creator, assignee, or admin)
exports.getSingleTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const userId = req.user._id.toString();
    const createdBy = task.createdBy.toString();
    const assignee = task.assignee ? task.assignee.toString() : null;

    // Authorization check
    if (
      req.user.role !== "admin" &&
      userId !== createdBy &&
      userId !== assignee
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you are not allowed to view this task"
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Get single task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task"
    });
  }
};

// @route   PUT /api/v1/tasks/:id
// @desc    Update task
// @access  Private (creator/admin: all fields, assignee: status only)
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, dueDate, assignee } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const userId = req.user._id.toString();
    const createdBy = task.createdBy.toString();
    const currentAssignee = task.assignee ? task.assignee.toString() : null;

    const isAdmin = req.user.role === "admin";
    const isCreator = userId === createdBy;
    const isAssignee = userId === currentAssignee;

    // If not admin, creator, or assignee -> forbidden
    if (!isAdmin && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you are not allowed to update this task"
      });
    }

    // Case 1: Assignee but NOT creator/admin -> can update only status
    if (isAssignee && !isCreator && !isAdmin) {
      if (Object.keys(req.body).length !== 1 || status === undefined) {
        return res.status(403).json({
          success: false,
          message: "Assignee can update only status field"
        });
      }

      task.status = status;
    } 
    // Case 2: Creator or Admin -> can update all fields
    else {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignee !== undefined) task.assignee = assignee;
    }

    await task.save();

    res.json({
      success: true,
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating task"
    });
  }
};

// @route   DELETE /api/v1/tasks/:id
// @desc    Delete task
// @access  Private (creator or admin only)
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const userId = req.user._id.toString();
    const createdBy = task.createdBy.toString();

    const isAdmin = req.user.role === "admin";
    const isCreator = userId === createdBy;

    // Only creator or admin can delete
    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you are not allowed to delete this task"
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting task"
    });
  }
};

// @route   GET /api/v1/tasks/stats
// @desc    Get task statistics
// @access  Private (user: own stats, admin: all stats)
exports.getTaskStats = async (req, res) => {
  try {
    let matchQuery = {};

    // If not admin, limit to own tasks
    if (req.user.role !== "admin") {
      matchQuery.createdBy = req.user._id;
    }

    // Total tasks
    const total = await Task.countDocuments(matchQuery);

    // Completed tasks
    const completed = await Task.countDocuments({
      ...matchQuery,
      status: "completed"
    });

    // Pending tasks
    const pending = await Task.countDocuments({
      ...matchQuery,
      status: "pending"
    });

    // By priority
    const low = await Task.countDocuments({
      ...matchQuery,
      priority: "low"
    });

    const medium = await Task.countDocuments({
      ...matchQuery,
      priority: "medium"
    });

    const high = await Task.countDocuments({
      ...matchQuery,
      priority: "high"
    });

    res.json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        byPriority: {
          low,
          medium,
          high
        }
      }
    });
  } catch (error) {
    console.error("Task stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching task statistics"
    });
  }
};