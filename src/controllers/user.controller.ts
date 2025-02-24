import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types/controller.types';
import { catchAsync } from '../utils/catchAsync';

export class UserController {
  public static getProfile = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const user = await UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    }
  );

  public static updateProfile = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const updateData = req.body;
      const updatedUser = await UserService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    }
  );

  public static getChauffeurProfile = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.params.userId || req.user!.id;
      const profile = await UserService.getChauffeurProfile(userId);

      res.status(200).json({
        success: true,
        data: profile
      });
    }
  );

  public static updateChauffeurProfile = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const updateData = req.body;
      const updatedProfile = await UserService.updateChauffeurProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Chauffeur profile updated successfully',
        data: updatedProfile
      });
    }
  );

  public static listChauffeurs = catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { available, verificationStatus, latitude, longitude, maxDistance } = req.query;

      const query: any = {};
      if (available !== undefined) {
        query.available = available === 'true';
      }
      if (verificationStatus) {
        query.verificationStatus = verificationStatus;
      }
      if (latitude && longitude) {
        query.location = {
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
          maxDistance: maxDistance ? parseFloat(maxDistance as string) : undefined
        };
      }

      const chauffeurs = await UserService.listChauffeurs(query);

      res.status(200).json({
        success: true,
        data: chauffeurs
      });
    }
  );
}