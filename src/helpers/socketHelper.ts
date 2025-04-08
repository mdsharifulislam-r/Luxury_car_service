import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { UserService } from '../app/modules/user/user.service';
import { jwtHelper } from './jwtHelper';
import config from '../config';

const socket = (io: Server) => {
  


  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));
    UserService.getAndSetLiveLocationAndSaveToDB(socket)
    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};






export const socketHelper = { socket };
