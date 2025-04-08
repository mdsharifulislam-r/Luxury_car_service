import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
import { DislaimberRoutes } from '../app/modules/disclaimber/dislaimber.route';
import { ServiceRoutes } from '../app/modules/service/service.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { PaymentRoutes } from '../app/modules/payment/payment.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { MessageRoutes } from '../app/modules/message/message.route';
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
    path:"/payment",
    route: PaymentRoutes
  },
  {
    path:"/subscribe",
    route:SubscriptionRoutes
  },
  {
    path:"/disclaimer",
    route: DislaimberRoutes
  },
  {
    path:"/service",
    route: ServiceRoutes
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path:"/notification",
    route: NotificationRoutes
  },
  {
    path:"/book",
    route:OrderRoutes
  },
  {
    path:"/review",
    route:ReviewRoutes
  },
  {
    path:"/message",
    route:MessageRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
