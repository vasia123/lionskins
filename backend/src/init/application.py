# -*- coding: utf-8 -*-

import os
import sys
import logging

from flask import Flask

from . import cors, db


def create_application():

    static_folder = os.path.join('..', 'static')
    template_folder = os.path.join('..', 'templates')

    application = Flask(__name__, static_folder=static_folder, template_folder=template_folder)
    try:
        application.config.update(
            DEBUG=os.environ.get('FLASK_DEBUG', False),
            SECRET_KEY=os.environ.get('FLASK_SECRET_KEY', ''),
            MONGODB_SETTINGS={
                'db': os.environ['MONGO_DBNAME'],
                'host': os.environ['MONGO_HOSTNAME'],
                'port': int(os.environ['MONGO_PORT'])
            }
        )
    except KeyError as e:
        logging.error(f"Bad configuration, some environment variables are not set: {e.args[0]}")
        sys.exit(2)

    db.init_app(application)
    cors.init_app(application)
    return application
