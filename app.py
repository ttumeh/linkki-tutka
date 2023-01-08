# -*- coding: utf-8 -*-
# @Author: Tuomas Aaltonen <ttumeh>
# @Date: 22.12.2022
import json
import requests
from requests.auth import HTTPBasicAuth
from flask import Flask, render_template
from google.transit import gtfs_realtime_pb2
import config
import csv
import parse_entity

app = Flask(__name__)
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
def fetch_bus_locations(city):
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