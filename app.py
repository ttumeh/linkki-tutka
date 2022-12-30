import json
import requests
from requests.auth import HTTPBasicAuth
from flask import Flask, render_template, make_response
from google.transit import gtfs_realtime_pb2
import config
import random

app = Flask(__name__)
CLIENT_ID = config.CLIENT_ID
CLIENT_SECRET = config.CLIENT_SECRET


@app.route('/')
def homepage():
    """Flask-function for the main page"""
    bckgrd = fancy_background()
    return render_template('index.html', bckgrd=bckgrd)


def fancy_background():
    """Flask-function creates fancy background text"""
    x = 0
    random_lines = ""
    while x<10:
        random_lines += random_lines + " " + (random.choice(open("static/words.txt").readlines()))
        x=x+1
    return random_lines


@app.route('/bus_locations', methods=['GET'])
def fetch_bus_locations():
    """Flask function for fetching GTFS feed and returning it to client.js"""
    # Initialize feed
    feed = gtfs_realtime_pb2.FeedMessage()
    url = f"https://data.waltti.fi/jyvaskyla/api/gtfsrealtime/v1.0/feed/vehicleposition"
    response = requests.get(url, auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET))
    feed.ParseFromString(response.content)
    # Initialize data json
    data = {}
    x=0
    # Loop through the feed, set wanted keys
    for entity in feed.entity:
        data[x] = {}
        data[x]['id'] = entity.id
        data[x]['label'] = entity.vehicle.vehicle.label
        data[x]['latitude'] = entity.vehicle.position.latitude
        data[x]['longitude'] = entity.vehicle.position.longitude
        data[x]['status'] = entity.vehicle.current_status
        x=x+1
    json_data = json.dumps(data)
    return json_data