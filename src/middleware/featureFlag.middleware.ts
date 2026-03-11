import { Request, Response, NextFunction } from 'express';
import env from '../config/env.config';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

type FeatureFlag = keyof typeof env.featureFlags;

const FEATURE_FLAG_NAMES: Record<FeatureFlag, string> = {
  FF_AUTH: 'Authentication',
  FF_CATEGORIES: 'Categories',
  FF_UNIT_TYPES: 'Unit Types',
  FF_SUPPLIERS: 'Suppliers',
  FF_PRODUCTS: 'Products',
  FF_CUSTOMERS: 'Customers',
  FF_SALES: 'Sales',
  FF_PURCHASES: 'Purchases',
  FF_EXPENSES: 'Expenses',
  FF_DASHBOARD: 'Dashboard',
  FF_USERS: 'Users',
  FF_REPORTS: 'Reports',
};

export const checkFeatureFlag = (feature: FeatureFlag) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const isEnabled = env.featureFlags[feature];

    if (!isEnabled) {
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: ERROR_MESSAGES.FEATURE_NOT_ENABLED,
        fallback: 'database',
        message: `The ${FEATURE_FLAG_NAMES[feature]} feature is not yet migrated to the API. Using direct database connection.`,
        feature,
      });
      return;
    }

    next();
  };
};

export const requireAnyFeature = (...features: FeatureFlag[]) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const hasAnyEnabled = features.some((feature) => env.featureFlags[feature]);

    if (!hasAnyEnabled) {
      const featureNames = features.map((f) => FEATURE_FLAG_NAMES[f]).join(', ');
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: ERROR_MESSAGES.FEATURE_NOT_ENABLED,
        fallback: 'database',
        message: `None of the following features are enabled: ${featureNames}. Using direct database connection.`,
        features,
      });
      return;
    }

    next();
  };
};

export const getAllFeatureFlags = (): Record<string, boolean> => {
  return Object.entries(env.featureFlags).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, boolean>);
};

export default { checkFeatureFlag, requireAnyFeature, getAllFeatureFlags };
