#!/usr/bin/env node
// Backend/scripts/backup-database.js

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = require('../utils/logger');

/**
 * MongoDB Database Backup Script
 * Supports both local MongoDB and MongoDB Atlas
 */
class DatabaseBackup {
  constructor() {
    this.mongoUri = process.env.MONGO_URI;
    this.backupDir = path.join(__dirname, '../backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;

    if (!this.mongoUri) {
      throw new Error('MONGO_URI environment variable is required');
    }
  }

  /**
   * Extract database name from MongoDB URI
   */
  getDatabaseName() {
    try {
      // For mongodb+srv://user:pass@cluster.xxx.mongodb.net/dbname
      const match = this.mongoUri.match(/\/([^?]+)(\?|$)/);
      return match ? match[1] : 'transparai';
    } catch (error) {
      logger.error('Failed to extract database name from URI', { error: error.message });
      return 'transparai'; // fallback
    }
  }

  /**
   * Generate backup filename with timestamp
   */
  getBackupFilename() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbName = this.getDatabaseName();
    return `${dbName}-backup-${timestamp}`;
  }

  /**
   * Create backup directory if it doesn't exist
   */
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      logger.info('Creating backup directory', { path: this.backupDir });
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  /**
   * Run mongodump command
   */
  async runMongoDump(backupPath) {
    return new Promise((resolve, reject) => {
      const isAtlas = this.mongoUri.includes('mongodb+srv://');

      let command;
      if (isAtlas) {
        // For MongoDB Atlas
        command = `mongodump --uri="${this.mongoUri}" --out="${backupPath}"`;
      } else {
        // For local MongoDB
        const dbName = this.getDatabaseName();
        command = `mongodump --uri="${this.mongoUri}" --db="${dbName}" --out="${backupPath}"`;
      }

      logger.info('Starting database backup', {
        command: command.replace(/\/\/[^@]+@/, '//***:***@'), // Hide credentials in logs
        backupPath,
      });

      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          logger.error('Backup command failed', {
            error: error.message,
            stderr,
          });
          return reject(error);
        }

        if (stderr && !stderr.includes('writing')) {
          logger.warn('Backup warnings', { stderr });
        }

        logger.info('Backup command completed', { stdout });
        resolve(stdout);
      });
    });
  }

  /**
   * Compress backup directory
   */
  async compressBackup(backupPath, filename) {
    const tarFile = path.join(this.backupDir, `${filename}.tar.gz`);

    return new Promise((resolve, reject) => {
      const command = `tar -czf "${tarFile}" -C "${this.backupDir}" "${filename}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error('Compression failed', { error: error.message });
          return reject(error);
        }

        logger.info('Backup compressed successfully', {
          tarFile,
          size: 'calculating...',
        });

        resolve(tarFile);
      });
    });
  }

  /**
   * Get file size in human readable format
   */
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const bytes = stats.size;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Byte';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return `${Math.round(bytes / 1024 ** i * 100) / 100} ${sizes[i]}`;
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter((file) =>
        file.endsWith('.tar.gz') && file.includes('backup-'));

      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > retentionMs) {
          await fs.unlink(filePath);
          logger.info('Deleted old backup', { file, age: `${Math.floor((now - stats.mtime.getTime()) / (24 * 60 * 60 * 1000))} days` });
        }
      }

      logger.info('Backup cleanup completed', {
        retentionDays: this.retentionDays,
        remainingBackups: (await fs.readdir(this.backupDir)).filter((f) => f.endsWith('.tar.gz')).length,
      });
    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
    }
  }

  /**
   * Send backup notification
   */
  async sendNotification(success, details = {}) {
    try {
      if (process.env.ALERT_EMAIL_ENABLED === 'true' && process.env.SMTP_HOST) {
        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const subject = success ? '✅ Database Backup Successful' : '❌ Database Backup Failed';
        const text = success
          ? `Database backup completed successfully.\n\nDetails:\n${JSON.stringify(details, null, 2)}`
          : `Database backup failed.\n\nError:\n${details.error}`;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.ALERT_EMAIL_TO,
          subject,
          text,
        });

        logger.info('Backup notification sent via email');
      }
    } catch (error) {
      logger.error('Failed to send backup notification', { error: error.message });
    }
  }

  /**
   * Main backup method
   */
  async performBackup() {
    const startTime = Date.now();
    const filename = this.getBackupFilename();
    const backupPath = path.join(this.backupDir, filename);

    try {
      logger.info('Starting database backup process', {
        database: this.getDatabaseName(),
        timestamp: new Date().toISOString(),
      });

      // Ensure backup directory exists
      await this.ensureBackupDirectory();

      // Run mongodump
      await this.runMongoDump(backupPath);

      // Compress the backup
      const tarFile = await this.compressBackup(backupPath, filename);

      // Get backup file size
      const fileSize = await this.getFileSize(tarFile);

      // Clean up uncompressed directory
      await fs.rm(backupPath, { recursive: true, force: true });

      // Clean up old backups
      await this.cleanupOldBackups();

      const duration = Math.round((Date.now() - startTime) / 1000);
      const details = {
        filename: path.basename(tarFile),
        size: fileSize,
        duration: `${duration}s`,
        database: this.getDatabaseName(),
        timestamp: new Date().toISOString(),
      };

      logger.info('Database backup completed successfully', details);
      await this.sendNotification(true, details);

      return details;
    } catch (error) {
      logger.error('Database backup failed', {
        error: error.message,
        stack: error.stack,
      });

      await this.sendNotification(false, { error: error.message });

      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const backup = new DatabaseBackup();

  backup.performBackup()
    .then((result) => {
      console.log('✅ Backup completed successfully:');
      console.log(`   File: ${result.filename}`);
      console.log(`   Size: ${result.size}`);
      console.log(`   Duration: ${result.duration}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backup failed:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseBackup;
