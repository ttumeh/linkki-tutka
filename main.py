# -*- coding: utf-8 -*-
# @Author: Tuomas Aaltonen <ttumeh>
# @Date: 22.12.2022
import json
import requests
import csv
from requests.auth import HTTPBasicAuth
from flask import Flask, render_template, redirect, url_for
from google.transit import gtfs_realtime_pb2
import config
import parse_entity
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
CLIENT_ID = config.CLIENT_ID
CLIENT_SECRET = config.CLIENT_SECRET


def csv_to_json():
    """Function converts GTFS Static Package to JSON format"""
    data_dict = {}
    with open('static/routes/routes.txt', encoding = 'utf-8') as csv_file_handler:
        csv_reader = csv.DictReader(csv_file_handler)
        for rows in csv_reader:
            key = rows['route_id']
            data_dict[key] = rows
        with open('static/routes/routes_oulu.json', 'w', encoding = 'utf-8') as json_file_handler:
            json_file_handler.write(json.dumps(data_dict, indent = 4))


@app.route('/')
def homepage():
    """Flask-function for the main page"""
    return render_template('index.html')

@app.route('/bus_locations/<city>', methods=['GET'])
def bus_locations(city):
    """Flask function for fetching GTFS feed and returning it to client.js"""
    # Initialize feed
    feed = gtfs_realtime_pb2.FeedMessage()
    url = f"https://data.waltti.fi/{city}/api/gtfsrealtime/v1.0/feed/vehicleposition"
    response = requests.get(url, auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET))
    feed.ParseFromString(response.content)
    # Initialize data json
    data = {}
    x=0
    # Loop through the feed
    for entity in feed.entity:
        data[x] = {}
        data = parse_entity.EntityParser.parse(data, entity, x, city)
        x=x+1
    json_data = json.dumps(data)
    return json_data

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)