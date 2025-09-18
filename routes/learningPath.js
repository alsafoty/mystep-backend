const express = require('express');
const { body, validationResult } = require('express-validator');
const LearningPath = require('../models/LearningPath');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/learning-path
// @desc    Create or update learning path
// @access  Private
router.post('/', [
  auth,
  body('jobTitle')
    .trim()
    .notEmpty()
    .withMessage('Job title is required'),
  body('experience')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Experience must be beginner, intermediate, or advanced'),
  body('existingSkills')
    .isArray()
    .withMessage('Existing skills must be an array'),
  body('skills')
    .isArray()
    .withMessage('Skills must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      jobTitle, 
      targetRole, 
      experience, 
      existingSkills, 
      skills,
      estimatedCompletionTime,
      apiResponse 
    } = req.body;

    // Deactivate existing learning path
    await LearningPath.updateMany(
      { userId: req.user.id },
      { isActive: false }
    );

    // Process skills data
    const processedSkills = skills.map(skill => {
      // Handle both object and string formats
      const skillName = typeof skill === 'object' ? skill.skill_name || skill.skillName : skill;
      const learningTopics = typeof skill === 'object' ? skill.learning_topics || [] : [];
      
      return {
        skillName,
        learningTopics,
        status: 'learning',
        projects: [], // Projects will be added separately
        progressPercentage: 0
      };
    });

    // Create new learning path
    const learningPath = new LearningPath({
      userId: req.user.id,
      jobTitle,
      targetRole,
      experience,
      existingSkills: existingSkills || [],
      skills: processedSkills,
      estimatedCompletionTime,
      apiResponse,
      overallProgress: 0
    });

    await learningPath.save();

    res.status(201).json({
      success: true,
      message: 'Learning path created successfully',
      data: { learningPath }
    });

  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating learning path'
    });
  }
});

// @route   GET /api/learning-path
// @desc    Get user's active learning path
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    res.json({
      success: true,
      data: { learningPath }
    });

  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/learning-path/skills/:skillId/projects
// @desc    Add projects to a skill
// @access  Private
router.post('/skills/:skillId/projects', [
  auth,
  body('projects')
    .isArray()
    .withMessage('Projects must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { projects } = req.body;
    const { skillId } = req.params;

    const learningPath = await LearningPath.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    const skill = learningPath.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Process and add projects
    const processedProjects = projects.map(project => ({
      title: project.title,
      description: project.description || '',
      difficulty: project.difficulty || 'beginner',
      estimatedHours: project.estimatedHours || 10,
      status: 'Not Started'
    }));

    skill.projects = processedProjects;
    await learningPath.save();

    res.json({
      success: true,
      message: 'Projects added to skill successfully',
      data: { skill }
    });

  } catch (error) {
    console.error('Add projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/learning-path/skills/:skillId/projects/:projectId
// @desc    Update project status
// @access  Private
router.put('/skills/:skillId/projects/:projectId', [
  auth,
  body('status')
    .isIn(['Not Started', 'In Progress', 'Done'])
    .withMessage('Status must be: Not Started, In Progress, or Done')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const { skillId, projectId } = req.params;

    const learningPath = await LearningPath.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    const skill = learningPath.skills.id(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    const project = skill.projects.id(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project status
    project.status = status;
    
    if (status === 'In Progress' && !project.startedAt) {
      project.startedAt = new Date();
    } else if (status === 'Done') {
      project.completedAt = new Date();
      if (!project.startedAt) {
        project.startedAt = new Date();
      }
    }

    // Update skill progress
    learningPath.updateSkillProgress(skillId);
    
    await learningPath.save();

    res.json({
      success: true,
      message: 'Project status updated successfully',
      data: { 
        project,
        skillProgress: skill.progressPercentage,
        overallProgress: learningPath.overallProgress
      }
    });

  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/learning-path/skills/:skillName
// @desc    Get skill by name with projects
// @access  Private
router.get('/skills/:skillName', auth, async (req, res) => {
  try {
    const { skillName } = req.params;
    
    const learningPath = await LearningPath.findOne({ 
      userId: req.user.id, 
      isActive: true 
    });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    const skill = learningPath.skills.find(s => 
      s.skillName.toLowerCase() === skillName.toLowerCase()
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: { skill }
    });

  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/learning-path
// @desc    Delete current learning path
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const result = await LearningPath.updateMany(
      { userId: req.user.id, isActive: true },
      { isActive: false }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active learning path found'
      });
    }

    res.json({
      success: true,
      message: 'Learning path deleted successfully'
    });

  } catch (error) {
    console.error('Delete learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;