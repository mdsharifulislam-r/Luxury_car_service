import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
import { DislaimberRoutes } from '../app/modules/disclaimber/dislaimber.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path:"/subscribe",
    route:SubscriptionRoutes
  },
  {
    path:"/disclaimer",
    route: DislaimberRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
