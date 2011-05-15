import os
import sys
import random
import logging
import logging.config

from geventwebsocket.handler import WebSocketHandler
from gevent import pywsgi
from gevent import sleep

import simplejson
from xml.sax.saxutils import escape

LOGGING_CONF = 'log.conf'
logging.config.fileConfig(LOGGING_CONF)

#logger setting.
logger = logging.getLogger('app')

ws_list = set()
last_position = {}
room = {}

def handle(environ, start_response):
    path = environ['PATH_INFO']
    if path not in room:
        room.update({path:{'ws_list': set(), 'last_position': {}}})

    ws = environ['wsgi.websocket']
    room[path]['ws_list'].add(ws)
    
    while 1:
        msg = ws.wait()
        if msg is None:
            break

        try:
            session = ':'.join(str(x) for x in ws.socket.getpeername())
            
            logger.info('[room: %s] session: %s, message: %s' % (path, session, msg))

            if msg == 'Heartbeat':
                continue;
        
            json = simplejson.loads(msg)

            if 'get' in json['mode']:
                logger.info('[room: %s] Get all session.' % (path))
                for k, v in room[path]['last_position'].items():
                    v.update({'mode': 'create'})
                    ws.send(simplejson.dumps(v))
                continue

            elif 'message' in json['mode']:
                message = json['message']
                json.update({'message': escape(message)})
                msg = simplejson.dumps(json)

            for mode in ['move', 'create', 'face']:
                if mode in json['mode']:
                    if 'move' in json['mode']:
                        tmp = {'name':json['name'], 'x':json['x'], 'y':json['y']}

                    elif 'create'in json['mode']:
                        tmp = {'name':json['name'], 'x':json['x'], 'y':json['y'], 'face':json['face']}

                    elif 'face' in json['mode']:
                        tmp = {'face':json['face']}

                    if session in room[path]['last_position']:
                        room[path]['last_position'][session].update(tmp)
                    else:
                        room[path]['last_position'].update({session: tmp})

        except:
            logger.error('[room: %s] %s' % (path, sys.exc_info()[0]))

        #logger.info('[room: %s] session: %s' % (path, ':'.join(str(x) for x in ws.socket.getpeername())))
        
        #for k,v in room[path]['last_position'].items():
        #    print k, v

        remove = set()
        remove_user = []
        for s in room[path]['ws_list']:
            try:
                s.send(msg)
            except Exception:
                # if s.send is failed, send remove message to all user. 
                remove.add(s)
                try:
                    tmp = room[path]['last_position'][':'.join(str(x) for x in s.socket.getpeername())]
                    remove_user.append(tmp['name'])
                except:
                    logger.error('[room: %s] append user failed.' % (path))
        
        for s in remove:
            try:
                room[path]['ws_list'].remove(s)
                del room[path]['last_position'][':'.join(str(x) for x in s.socket.getpeername())]
            except:
                logger.error('[room: %s] remove user failed.' % (path))

        for user in remove_user:
            for s in room[path]['ws_list']:
                try:
                    s.send(simplejson.dumps({'mode': 'remove','name': user}))
                    logger.info('[room: %s] send remove user message. remove user: %s' % (path, user))
                except:
                    logger.error('[room: %s] send remove user message failed. remove user: %s' % (path, user))

        logger.info('[room: %s] connected: %d' % (path, len(room[path]['last_position'])))

    logger.info('[room: %s] EXIT!' % (path))
    logger.info('[room: %s] connected: %d' % (path, len(room[path]['last_position'])))

logger.info('Starting rpg_server.py ...')

server = pywsgi.WSGIServer(('0.0.0.0', 8000), handle, handler_class=WebSocketHandler)
server.serve_forever()
