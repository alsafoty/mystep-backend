const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title cannot exceed 100 characters'),
  body('experience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Experience must be beginner, intermediate, or advanced')
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

    const { name, jobTitle, experience } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (jobTitle !== undefined) updateFields.jobTitle = jobTitle;
    if (experience !== undefined) updateFields.experience = experience;

    // Check if this is completing the profile
    if (jobTitle || experience) {
      updateFields.profileCompleted = true;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user learning statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ userId: req.user.id, isActive: true });
    
    if (!learningPath) {
      return res.json({
        success: true,
        data: {
          stats: {
            totalSkills: 0,
            completedSkills: 0,
            totalProjects: 0,
            completedProjects: 0,
            overallProgress: 0
          }
        }
      });
    }

    // Calculate statistics
    const totalSkills = learningPath.skills.length;
    const completedSkills = learningPath.skills.filter(skill => skill.status === 'completed' || skill.status === 'mastered').length;
    
    let totalProjects = 0;
    let completedProjects = 0;

    learningPath.skills.forEach(skill => {
      totalProjects += skill.projects.length;
      completedProjects += skill.projects.filter(project => project.status === 'Done').length;
    });

    const stats = {
      totalSkills,
      completedSkills,
      totalProjects,
      completedProjects,
      overallProgress: learningPath.overallProgress,
      existingSkills: learningPath.existingSkills?.length || 0,
      estimatedCompletionTime: learningPath.estimatedCompletionTime
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;