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