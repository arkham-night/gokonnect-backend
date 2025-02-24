import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { UserRole } from '../types/common.types';

const router = Router();

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }).optional(),
});

const updateChauffeurProfileSchema = z.object({
  licenseNumber: z.string().optional(),
  licenseExpiry: z.date().optional(),
  experience: z.number().optional(),
  isAvailable: z.boolean().optional(),
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

router.get('/profile', authenticate, UserController.getProfile);
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  UserController.updateProfile
);

router.get(
  '/chauffeurs',
  authenticate,
  authorize(UserRole.CUSTOMER, UserRole.ADMIN),
  UserController.listChauffeurs
);

router.get(
  '/chauffeur/profile',
  authenticate,
  authorize(UserRole.CHAUFFEUR),
  UserController.getChauffeurProfile
);

router.patch(
  '/chauffeur/profile',
  authenticate,
  authorize(UserRole.CHAUFFEUR),
  validate(updateChauffeurProfileSchema),
  UserController.updateChauffeurProfile
);

export default router;