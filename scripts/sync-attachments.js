#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

/* ----------------------------------------
 * Config
 * ---------------------------------------- */

const CONTENT_TYPES = ['posts', 'pages', 'docs'];

const ATTACHMENT_EXTENSIONS =
  /\.(pdf|mp4|webm|mov|mp3|wav|ogg|m4a|zip|tar|gz|7z|csv|xlsx|docx|pptx)$/i;

const SRC_ROOT = 'src/content';
const PUBLIC_ROOT = 'public';

/* ----------------------------------------
 * Utilities
 * ---------------------------------------- */

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/* ----------------------------------------
 * Find attachments recursively
 * ---------------------------------------- */

async function findAttachments(dir, relative = '') {
  const results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const absPath = path.join(dir, entry.name);
      const relPath = path.join(relative, entry.name);

      if (entry.isDirectory()) {
        results.push(...await findAttachments(absPath, relPath));
      } else if (ATTACHMENT_EXTENSIONS.test(entry.name)) {
        results.push({
          source: absPath,
          relative: relPath,
        });
      }
    }
  } catch {
    /* directory may not exist */
  }

  return results;
}

/* ----------------------------------------
 * Sync shared attachments
 * ---------------------------------------- */

async function syncSharedAttachments(type) {
  const srcDir = path.join(SRC_ROOT, type, 'attachments');
  const outDir = path.join(PUBLIC_ROOT, type, 'attachments');

  const files = await findAttachments(srcDir);
  if (files.length === 0) return;

  for (const file of files) {
    const target = path.join(outDir, file.relative);
    await ensureDir(path.dirname(target));
    await fs.copyFile(file.source, target);
  }

  console.log(`✔ ${type}: synced shared attachments`);
}

/* ----------------------------------------
 * Sync folder-based attachments
 * ---------------------------------------- */

async function syncFolderAttachments(type) {
  const baseDir = path.join(SRC_ROOT, type);

  let entries;
  try {
    entries = await fs.readdir(baseDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const entryName = entry.name;
    const attachmentDir = path.join(baseDir, entryName, 'attachments');

    if (!(await fileExists(attachmentDir))) continue;

    const files = await findAttachments(attachmentDir);

    for (const file of files) {
      // strip "attachments/" prefix
      const cleanPath = file.relative.replace(/^attachments[\\/]/, '');
      const target = path.join(PUBLIC_ROOT, type, entryName, cleanPath);

      await ensureDir(path.dirname(target));
      await fs.copyFile(file.source, target);
    }

    console.log(`✔ ${type}/${entryName}: synced attachments`);
  }
}

/* ----------------------------------------
 * Main
 * ---------------------------------------- */

async function syncAll() {
  console.log('📎 Syncing content attachments…');

  for (const type of CONTENT_TYPES) {
    await syncSharedAttachments(type);
    await syncFolderAttachments(type);
  }

  console.log('🎉 Attachment sync complete');
}

syncAll();
