import json
import requests
from requests.auth import HTTPBasicAuth
from flask import Flask, render_template, make_response
from google.transit import gtfs_realtime_pb2
import config

app = Flask(__name__)
CLIENT_ID = config.CLIENT_ID
CLIENT_SECRET = config.CLIENT_SECRET


@app.route('/')
def homepage():
    """Flask-funktio sovelluksen etusivulle"""
    return render_template('index.html')


@app.route('/bus_locations', methods=['GET'])
def fetch_bus_locations():
    feed = gtfs_realtime_pb2.FeedMessage()
    url = "https://data.waltti.fi/jyvaskyla/api/gtfsrealtime/v1.0/feed/vehicleposition"
    response = requests.get(url, auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET))
    feed.ParseFromString(response.content)
    data = {}
    x=0
    for entity in feed.entity:
        data[x] = {}
        data[x]['id'] = entity.id
        data[x]['latitude'] = entity.vehicle.position.latitude
        data[x]['longitude'] = entity.vehicle.position.longitude
        x=x+1
    json_data = json.dumps(data)
    return json_data