import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const user1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'password123'
    });
    await user1.save();

    const user2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: 'password123'
    });
    await user2.save();

    console.log('👥 Created users');

    // Create tasks for user1
    const tasksUser1 = [
      {
        userId: user1._id,
        title: 'Complete project proposal',
        description: 'Write and submit the Q1 project proposal',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-01-25')
      },
      {
        userId: user1._id,
        title: 'Review code changes',
        description: 'Review pull requests from team members',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date('2026-01-20')
      },
      {
        userId: user1._id,
        title: 'Update documentation',
        description: 'Update API documentation with new endpoints',
        priority: 'Low',
        status: 'Completed',
        dueDate: new Date('2026-01-15'),
        completedAt: new Date('2026-01-15')
      },
      {
        userId: user1._id,
        title: 'Team meeting preparation',
        description: 'Prepare slides for weekly team sync',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date('2026-01-16'),
        completedAt: new Date('2026-01-16')
      },
      {
        userId: user1._id,
        title: 'Fix bug in authentication',
        description: 'Resolve JWT token expiration issue',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-01-18')
      },
      {
        userId: user1._id,
        title: 'Database optimization',
        description: 'Add indexes to improve query performance',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date('2026-01-30')
      },
      {
        userId: user1._id,
        title: 'Write unit tests',
        description: 'Add test coverage for new features',
        priority: 'High',
        status: 'Todo',
        dueDate: new Date('2026-01-22')
      },
      {
        userId: user1._id,
        title: 'Client demo',
        description: 'Prepare demo for client presentation',
        priority: 'High',
        status: 'Todo',
        dueDate: new Date('2026-01-28')
      },
      {
        userId: user1._id,
        title: 'Research new framework',
        description: 'Evaluate Next.js for upcoming project',
        priority: 'Low',
        status: 'Todo',
        dueDate: new Date('2026-02-05')
      },
      {
        userId: user1._id,
        title: 'Security audit',
        description: 'Conduct security review of authentication flow',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date('2026-01-14'),
        completedAt: new Date('2026-01-14')
      }
    ];

    // Create tasks for user2
    const tasksUser2 = [
      {
        userId: user2._id,
        title: 'Design new landing page',
        description: 'Create mockups for homepage redesign',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-01-24')
      },
      {
        userId: user2._id,
        title: 'User research interviews',
        description: 'Conduct 5 user interviews for feedback',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date('2026-01-26')
      },
      {
        userId: user2._id,
        title: 'Update style guide',
        description: 'Add new color palette to design system',
        priority: 'Low',
        status: 'Completed',
        dueDate: new Date('2026-01-12'),
        completedAt: new Date('2026-01-12')
      },
      {
        userId: user2._id,
        title: 'Mobile app wireframes',
        description: 'Create wireframes for mobile version',
        priority: 'High',
        status: 'Todo',
        dueDate: new Date('2026-01-29')
      },
      {
        userId: user2._id,
        title: 'Accessibility review',
        description: 'Ensure WCAG 2.1 AA compliance',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: new Date('2026-01-21')
      },
      {
        userId: user2._id,
        title: 'Icon set creation',
        description: 'Design custom icon set for dashboard',
        priority: 'Low',
        status: 'Todo',
        dueDate: new Date('2026-02-01')
      },
      {
        userId: user2._id,
        title: 'Brand guidelines update',
        description: 'Revise brand guidelines document',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date('2026-01-13'),
        completedAt: new Date('2026-01-13')
      },
      {
        userId: user2._id,
        title: 'Prototype testing',
        description: 'Test interactive prototype with users',
        priority: 'High',
        status: 'Todo',
        dueDate: new Date('2026-01-27')
      },
      {
        userId: user2._id,
        title: 'Newsletter design',
        description: 'Create email template for monthly newsletter',
        priority: 'Low',
        status: 'Completed',
        dueDate: new Date('2026-01-10'),
        completedAt: new Date('2026-01-10')
      },
      {
        userId: user2._id,
        title: 'Dashboard UI improvements',
        description: 'Enhance data visualization components',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: new Date('2026-01-23')
      }
    ];

    await Task.insertMany([...tasksUser1, ...tasksUser2]);
    console.log('✅ Created 20 tasks');

    console.log('\n📊 Seed Summary:');
    console.log(`   Users: 2`);
    console.log(`   Tasks: 20`);
    console.log('\n🔑 Test Credentials:');
    console.log('   User 1: john@example.com / password123');
    console.log('   User 2: jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
