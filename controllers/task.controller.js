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
