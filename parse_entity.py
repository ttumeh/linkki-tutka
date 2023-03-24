# -*- coding: utf-8 -*-
# @Author: Tuomas Aaltonen <ttumeh>
# @Date: 22.12.2022
import json


class EntityParser:
    def parse(data, entity, count, city):
        """Function to parse data object"""
        try:
            data[count] = {}
            data[count]['id'] = entity.id
            data[count]['label'] = entity.vehicle.vehicle.label
            data[count]['latitude'] = entity.vehicle.position.latitude
            data[count]['longitude'] = entity.vehicle.position.longitude
            data[count]['status'] = entity.vehicle.current_status
        except: pass
        try:
            with open(f'static/routes/routes_{city}.json', 'r') as route_data:
                json_data = json.load(route_data)
                data[count]['route_short_name']=json_data[entity.vehicle.trip.route_id]['route_short_name']
                data[count]['route_long_name']=json_data[entity.vehicle.trip.route_id]['route_long_name']
        except:
                data[count]['route_short_name']=""
                data[count]['route_long_name']="LINJAA EI LÖYDY"
        return data