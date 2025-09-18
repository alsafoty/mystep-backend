const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Done'],
    default: 'Not Started'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedHours: {
    type: Number,
    min: 1,
    max: 200
  },
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const skillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['existing', 'learning', 'completed', 'mastered'],
    default: 'learning'
  },
  learningTopics: [{
    type: String,
    trim: true
  }],
  projects: [projectSchema],
  completedAt: {
    type: Date
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  targetRole: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  existingSkills: [{
    type: String,
    trim: true
  }],
  skills: [skillSchema],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  estimatedCompletionTime: {
    type: String // e.g., "3-6 months"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date
  },
  apiResponse: {
    type: mongoose.Schema.Types.Mixed // Store original API response
  }
}, {
  timestamps: true
});

// Index for better query performance
learningPathSchema.index({ userId: 1 });
learningPathSchema.index({ 'skills.skillName': 1 });

// Calculate overall progress
learningPathSchema.methods.calculateProgress = function() {
  if (this.skills.length === 0) return 0;
  
  const totalProgress = this.skills.reduce((sum, skill) => sum + skill.progressPercentage, 0);
  this.overallProgress = Math.round(totalProgress / this.skills.length);
  return this.overallProgress;
};

// Update skill progress based on completed projects
learningPathSchema.methods.updateSkillProgress = function(skillId) {
  const skill = this.skills.id(skillId);
  if (!skill) return;
  
  const totalProjects = skill.projects.length;
  if (totalProjects === 0) {
    skill.progressPercentage = 0;
    return;
  }
  
  const completedProjects = skill.projects.filter(p => p.status === 'Done').length;
  skill.progressPercentage = Math.round((completedProjects / totalProjects) * 100);
  
  // Mark skill as completed if all projects are done
  if (skill.progressPercentage === 100) {
    skill.status = 'completed';
    skill.completedAt = new Date();
  } else if (skill.progressPercentage > 0) {
    skill.status = 'learning';
  }
  
  // Recalculate overall progress
  this.calculateProgress();
};

// Mark project as started
learningPathSchema.methods.startProject = function(skillId, projectId) {
  const skill = this.skills.id(skillId);
  if (!skill) return false;
  
  const project = skill.projects.id(projectId);
  if (!project) return false;
  
  if (project.status === 'Not Started') {
    project.status = 'In Progress';
    project.startedAt = new Date();
    this.updateSkillProgress(skillId);
    return true;
  }
  return false;
};

// Mark project as completed
learningPathSchema.methods.completeProject = function(skillId, projectId) {
  const skill = this.skills.id(skillId);
  if (!skill) return false;
  
  const project = skill.projects.id(projectId);
  if (!project) return false;
  
  if (project.status !== 'Done') {
    project.status = 'Done';
    project.completedAt = new Date();
    if (!project.startedAt) {
      project.startedAt = new Date();
    }
    this.updateSkillProgress(skillId);
    return true;
  }
  return false;
};

module.exports = mongoose.model('LearningPath', learningPathSchema);