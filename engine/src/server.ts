import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import JSZip from 'jszip';
import { runFullPipeline } from './engine';

// Load .env from root devpilot-app directory and local folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'devpilot-engine-microservice' });
});

app.post('/api/export', async (req, res) => {
  try {
    const { fileTree, title } = req.body;
    if (!fileTree) {
      return res.status(400).json({ error: 'fileTree is required' });
    }

    const zip = new JSZip();

    const addNodeToZip = (node: any, currentFolder: JSZip) => {
      if (node.type === 'file') {
        currentFolder.file(node.name, node.content || '');
      } else if (node.type === 'folder') {
        const folder = currentFolder.folder(node.name);
        if (folder && node.children) {
          for (const child of node.children) {
            addNodeToZip(child, folder);
          }
        }
      }
    };

    if (fileTree.type === 'folder' && fileTree.children) {
      for (const child of fileTree.children) {
        addNodeToZip(child, zip);
      }
    } else {
      addNodeToZip(fileTree, zip);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const projTitle = (title || 'devpilot-project').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projTitle}.zip"`);
    res.send(zipBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Export failed' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { idea, tech_stack } = req.body;
    if (!idea) {
      return res.status(400).json({ error: 'idea field is required' });
    }
    const result = await runFullPipeline(idea, tech_stack || 'react-fastapi-postgres');
    res.json(result);
  } catch (error: any) {
    console.error('Engine Pipeline Error:', error);
    res.status(500).json({ error: error?.message || 'Pipeline execution failed' });
  }
});

// Real-Time SSE Stream Endpoint
app.post('/api/generate-stream', async (req, res) => {
  const { idea, tech_stack } = req.body;
  if (!idea) {
    return res.status(400).json({ error: 'idea field is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await runFullPipeline(
      idea,
      tech_stack || 'react-fastapi-postgres',
      {
        onStageChange: (stage, status, data) => {
          sendEvent('stage_change', { stage, status, data });
        },
        onDebugProgress: (status, data) => {
          sendEvent('debug_progress', { status, data });
        }
      }
    );

    sendEvent('complete', result);
    res.end();
  } catch (error: any) {
    console.error('Engine Stream Error:', error);
    sendEvent('error', { message: error?.message || 'Pipeline stream failed' });
    res.end();
  }
});

app.listen(port, () => {
  console.log(`DevPilot Engine Microservice running on port ${port}`);
});
