#!/usr/bin/env node
// Backend/scripts/restore-database.js

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = require('../utils/logger');

/**
 * MongoDB Database Restore Script
 */
class DatabaseRestore {
  constructor() {
    this.mongoUri = process.env.MONGO_URI;
    this.backupDir = path.join(__dirname, '../backups');

    if (!this.mongoUri) {
      throw new Error('MONGO_URI environment variable is required');
    }
  }

  /**
   * List available backup files
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter((file) => file.endsWith('.tar.gz') && file.includes('backup-'))
        .map(async (file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: this.formatFileSize(stats.size),
            date: stats.mtime,
            path: filePath,
          };
        });

      const backups = await Promise.all(backupFiles);
      return backups.sort((a, b) => b.date - a.date); // Most recent first
    } catch (error) {
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Math.round(bytes / 1024 ** i * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Extract backup file
   */
  async extractBackup(backupFile) {
    const tempDir = path.join(this.backupDir, 'temp_restore');

    return new Promise((resolve, reject) => {
      const command = `tar -xzf "${backupFile}" -C "${this.backupDir}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error('Extraction failed', { error: error.message });
          return reject(error);
        }

        // Find the extracted directory
        const extractedDirName = path.basename(backupFile, '.tar.gz');
        const extractedPath = path.join(this.backupDir, extractedDirName);

        resolve(extractedPath);
      });
    });
  }

  /**
   * Restore from extracted backup
   */
  async runMongoRestore(extractedPath) {
    return new Promise((resolve, reject) => {
      // Find the database directory in the extracted backup
      const command = `mongorestore --uri="${this.mongoUri}" --drop "${extractedPath}"`;

      logger.info('Starting database restore', {
        command: command.replace(/\/\/[^@]+@/, '//***:***@'), // Hide credentials
        path: extractedPath,
      });

      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          logger.error('Restore command failed', {
            error: error.message,
            stderr,
          });
          return reject(error);
        }

        if (stderr) {
          logger.warn('Restore warnings', { stderr });
        }

        logger.info('Restore command completed', { stdout });
        resolve(stdout);
      });
    });
  }

  /**
   * Prompt user for backup selection
   */
  async promptBackupSelection(backups) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      console.log('\nAvailable backups:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.filename} (${backup.size}) - ${backup.date.toLocaleString()}`);
      });

      rl.question('\nSelect backup number to restore (or 0 to cancel): ', (answer) => {
        rl.close();
        const selection = parseInt(answer);

        if (selection === 0 || isNaN(selection)) {
          console.log('Restore cancelled.');
          resolve(null);
        } else if (selection > 0 && selection <= backups.length) {
          resolve(backups[selection - 1]);
        } else {
          console.log('Invalid selection.');
          resolve(null);
        }
      });
    });
  }

  /**
   * Confirm restore operation
   */
  async confirmRestore(backup) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      console.log('\n⚠️  WARNING: This will completely replace your current database with the backup:');
      console.log(`   File: ${backup.filename}`);
      console.log(`   Date: ${backup.date.toLocaleString()}`);
      console.log(`   Size: ${backup.size}`);
      console.log('\n   This action cannot be undone!');

      rl.question('\nType "CONFIRM" to proceed with restore: ', (answer) => {
        rl.close();
        resolve(answer === 'CONFIRM');
      });
    });
  }

  /**
   * Clean up temporary files
   */
  async cleanup(extractedPath) {
    try {
      await fs.rm(extractedPath, { recursive: true, force: true });
      logger.info('Cleanup completed', { path: extractedPath });
    } catch (error) {
      logger.warn('Cleanup failed', { error: error.message, path: extractedPath });
    }
  }

  /**
   * Main restore method
   */
  async performRestore(backupFilename = null) {
    const startTime = Date.now();

    try {
      // List available backups
      const backups = await this.listBackups();

      if (backups.length === 0) {
        throw new Error('No backup files found');
      }

      let selectedBackup;

      if (backupFilename) {
        // Use specified backup file
        selectedBackup = backups.find((b) => b.filename === backupFilename);
        if (!selectedBackup) {
          throw new Error(`Backup file not found: ${backupFilename}`);
        }
      } else {
        // Interactive selection
        selectedBackup = await this.promptBackupSelection(backups);
        if (!selectedBackup) {
          return null; // User cancelled
        }

        // Confirm the restore operation
        const confirmed = await this.confirmRestore(selectedBackup);
        if (!confirmed) {
          console.log('Restore cancelled by user.');
          return null;
        }
      }

      logger.info('Starting database restore process', {
        backup: selectedBackup.filename,
        timestamp: new Date().toISOString(),
      });

      // Extract the backup
      console.log('Extracting backup...');
      const extractedPath = await this.extractBackup(selectedBackup.path);

      // Restore the database
      console.log('Restoring database...');
      await this.runMongoRestore(extractedPath);

      // Clean up
      await this.cleanup(extractedPath);

      const duration = Math.round((Date.now() - startTime) / 1000);

      logger.info('Database restore completed successfully', {
        backup: selectedBackup.filename,
        duration: `${duration}s`,
        timestamp: new Date().toISOString(),
      });

      console.log('\n✅ Database restore completed successfully!');
      console.log(`   Backup: ${selectedBackup.filename}`);
      console.log(`   Duration: ${duration}s`);

      return {
        backup: selectedBackup.filename,
        duration: `${duration}s`,
      };
    } catch (error) {
      logger.error('Database restore failed', {
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
}

// CLI usage
if (require.main === module) {
  const restore = new DatabaseRestore();
  const backupFilename = process.argv[2]; // Optional backup filename

  restore.performRestore(backupFilename)
    .then((result) => {
      if (result) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Restore failed:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseRestore;
