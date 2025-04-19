import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { UserService } from '../app/modules/user/user.service';
import { jwtHelper } from './jwtHelper';
import config from '../config';
import { locationHelper } from './locationHelper';

const socket = (io: Server) => {
  


  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));
    //disconnect
    locationHelper.setAndGetLiveLocation(socket);
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};






export const socketHelper = { socket };
