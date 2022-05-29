import logo from './logo.svg';
import './App.css';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import React from 'react'
import { SERVERURL } from './SERVERURLS';
import { Map } from 'react-leaflet';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

let GreenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
})

L.Marker.prototype.options.icon = DefaultIcon;





class AppPage extends React.Component {

  constructor(props) {
    super()
    this.state = {
      markers: [],
      current_location: {
        lat: 51.505,
        long: -0.09
      },
      lat: 0,
      long: 0,
      data: [],
      mapzoom: 13,
    }


  }

  setPosition = (position) => {
    this.setState({
      lat: position.coords.latitude,
      long: position.coords.longitude,
      current_location: {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },

    }, () => {
      this.mapref.flyTo([position.coords.latitude, position.coords.longitude], 15)
    })
  }
  findLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition);
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  handleGetClosestTrucks = (response) => {
    console.log(response)
    if (!("status" in response) || !("payload" in response)) {
      alert("some error has occurred")
      return
    }
    if (response["status"] !== "success") {
      alert("failed to get proper response from server")
      return
    }

    /* prepare markers */

    var data = response.payload.features
    this.setState({
      data: data,
      current_location: {
        lat: this.state.lat,
        long: this.state.long,
      },
    })
  }

  getClosestTrucks = () => {

    this.setState({
      markers: []
    })

    fetch(SERVERURL + "close?" + new URLSearchParams({
      lat: this.state.lat,
      lng: this.state.long,
      num: 5
    }), {
      method: 'get',
    })
      .then((response) => {
        response.json()
          .then(val => {
            this.handleGetClosestTrucks(val)
          })
          .catch(val => {
            this.handleGetClosestTrucks({})
          })
      }
      )
      .catch(data => this.handleGetClosestTrucks({}));
  }

  render() {


    var markers = []

    for (var i in this.state.data) {
      const pos = [this.state.data[i].geometry.coordinates[1], this.state.data[i].geometry.coordinates[0]]
      markers.push(
        <Marker key={pos} position={pos}>
          <Popup>
            <b>{this.state.data[i].properties[9]}</b>
            <br />
            <i><b>{this.state.data[i].properties[12]}</b></i>
            <br />
            <p>
              {this.state.data[i].properties[19]}
            </p>
          </Popup>
        </Marker>
      )

      if (parseInt(i) === this.state.data.length - 1) {
        this.mapref.flyTo([this.state.lat, this.state.long], 16)
      }
    }




    /* current location marker */
    var currLocationDOM = null
    if (this.state.current_location) {
      currLocationDOM = <Marker key={[this.state.current_location.lat, this.state.current_location.long]} icon={GreenIcon} position={[this.state.current_location.lat, this.state.current_location.long]}>
        <Popup>
          Current Location
        </Popup>
      </Marker>
    }
    return (
      <div>
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          zIndex: 1000,
          padding: '1em',
          cursor: 'pointer',
          flexDirection: 'column'
        }}>
          <div>
            <table style={{
              width: '100%'
            }}>
              <tr>
                <td>
                  <label>Latitude</label>
                </td>
                <td>
                  <input type="text" value={this.state.lat} onChange={(e) => {
                    this.setState({ lat: e.target.value })
                  }} style={{
                    width: '100%'
                  }} />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Longitude</label>
                </td>
                <td>
                  <input type="text" value={this.state.long} onChange={(e) => {
                    this.setState({ long: e.target.value })
                  }} style={{
                    width: '100%'
                  }} />
                </td>
              </tr>
            </table>
          </div>
          <br />
          <button style={{
            // position: 'absolute',
            // top: '10px',
            // right: '10px',
            background: 'gray',
            zIndex: 1000,
            padding: '1em',
            cursor: 'pointer',
            flex: 1,

          }} onClick={() => {
            this.findLocation()
          }}>Get Current Location</button>
          &nbsp;
          <button style={{
            // position: 'absolute',
            // top: '10px',
            // right: '10px',
            background: 'gray',
            zIndex: 1000,
            padding: '1em',
            cursor: 'pointer',
            flex: 1,

          }} onClick={() => {
            this.getClosestTrucks()
          }}>Find From Given Location</button>
        </div>
        <MapContainer ref={(r) => { this.mapref = r }} center={[this.state.current_location.lat, this.state.current_location.long]} zoom={this.state.mapzoom} scrollWheelZoom={true} >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers}
          {currLocationDOM}
        </MapContainer>
      </div>
    )
  }


}

export default AppPage;
