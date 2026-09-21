import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { ProjectRepository } from '../repositories/projectRepository.js';

export const projectRouter = Router();

// Projects
projectRouter.get('/projects', async (req, res, next) => {
  try {
    const { city, status } = req.query as { city?: string; status?: string };
    const projects = await ProjectRepository.listProjects(city, status);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

projectRouter.post('/projects', requireAuth, async (req, res, next) => {
  try {
    const project = await ProjectRepository.createProject(req.body);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    next(err);
  }
});

projectRouter.post('/projects/:id/offers', requireAuth, async (req, res, next) => {
  try {
    const offer = await ProjectRepository.createOffer(req.params.id, req.body);
    res.status(201).json({ message: 'Project offer created', offer });
  } catch (err) {
    next(err);
  }
});

// Builders
projectRouter.get('/builders', async (_req, res, next) => {
  try {
    const builders = await ProjectRepository.listBuilders();
    res.json({ builders });
  } catch (err) {
    next(err);
  }
});

projectRouter.post('/builders', requireAuth, async (req, res, next) => {
  try {
    const builder = await ProjectRepository.createBuilder(req.user!.id, req.body);
    res.status(201).json({ message: 'Builder profile created', builder });
  } catch (err) {
    next(err);
  }
});

// Developers
projectRouter.get('/developers', async (_req, res, next) => {
  try {
    const developers = await ProjectRepository.listDevelopers();
    res.json({ developers });
  } catch (err) {
    next(err);
  }
});

projectRouter.post('/developers', requireAuth, async (req, res, next) => {
  try {
    const developer = await ProjectRepository.createDeveloper(req.user!.id, req.body);
    res.status(201).json({ message: 'Developer profile created', developer });
  } catch (err) {
    next(err);
  }
});
