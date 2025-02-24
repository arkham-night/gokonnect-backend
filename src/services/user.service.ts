import { User } from '../models/user.model';
import { Chauffeur } from '../models/chauffeur.model';
import { UserRole } from '../types/common.types';
import { AppError } from '../utils/error';

export class UserService {
  public static async getUserProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  public static async updateUserProfile(userId: string, updateData: Partial<User>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  public static async getChauffeurProfile(userId: string) {
    const chauffeur = await Chauffeur.findOne({ userId })
      .populate('userId', '-password');
    
    if (!chauffeur) {
      throw new AppError('Chauffeur profile not found', 404);
    }
    
    return chauffeur;
  }

  public static async updateChauffeurProfile(userId: string, updateData: Partial<Chauffeur>) {
    const chauffeur = await Chauffeur.findOne({ userId });
    if (!chauffeur) {
      throw new AppError('Chauffeur profile not found', 404);
    }

    Object.assign(chauffeur, updateData);
    await chauffeur.save();

    return chauffeur;
  }

  public static async listChauffeurs(query: {
    available?: boolean;
    verificationStatus?: string;
    location?: { latitude: number; longitude: number; maxDistance?: number };
  }) {
    let filter: any = {};

    if (query.available !== undefined) {
      filter.isAvailable = query.available;
    }

    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }

    if (query.location) {
      filter.currentLocation = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [query.location.longitude, query.location.latitude],
          },
          $maxDistance: query.location.maxDistance || 5000, // Default 5km
        },
      };
    }

    return Chauffeur.find(filter)
      .populate('userId', '-password')
      .sort({ rating: -1 });
  }
}