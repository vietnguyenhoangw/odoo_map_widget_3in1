/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { loadJS, loadCSS } from "@web/core/assets";

const {
	Component, useState, onWillStart, markup,
	onError, onMounted, onWillUpdateProps } = owl;

var directionsService;
var directionsRenderer
class MapWidgetDirection extends Component {
	async onGetMapBoxKey() {
		return await this.mapService.getMapBoxKey();
	}

	/**
	 * Get map by type
	 * @returns (1) opens street map / (2) google map
	 */
	async onGetGeoProvider() {
		const mapType = await this.mapService.getGeoProvider();
		if (!mapType) {
			return;
		}
		return mapType;
	}

	async onGetGGMapKey() {
		const ggMapKey = await this.mapService.getGGMapKey();
		if (!ggMapKey) {
			return;
		}
		return ggMapKey;
	}

	getOriginLatLong() {
		const latFieldName = this.props.origin_lat;
		const longFieldName = this.props.origin_long;

		let originLat = this.props.record.data[latFieldName];
		let originLong = this.props.record.data[longFieldName];

		// lat long validation
		if (originLat > 90.0000000 || originLat < -90.0000000 ||
			originLong > 180.0000000 || originLong < -180.0000000) {
			this.notificationService.add("Lat/Long origin is invalid.", { type: 'warning' });
			return { originLat: 0, originLong: 0 };
		}

		return { originLat, originLong };
	}

	getLatLongByIndex(index) {
		const latFieldName = this.props[`lat${index}`];
		const longFieldName = this.props[`long${index}`];

		let lat = this.props.record.data[latFieldName];
		let long = this.props.record.data[longFieldName];

		// lat long validation
		if (lat > 90.0000000 || lat < -90.0000000 ||
			long > 180.0000000 || long < -180.0000000) {
			this.notificationService.add(`Lat/Long at index ${index} is invalid.`, { type: 'warning' });
			return { lat: 0, long: 0 };
		}

		return { lat, long }
	}

	onChangeStartPoint(ev) {
		const startPointIndex = ev.target.selectedIndex;
		this.state.startLocationIndex = startPointIndex;
	}

	onChangeEndPoint(ev) {
		const endPointIndex = ev.target.selectedIndex;
		this.state.endLocationIndex = endPointIndex;
	}

	async onPressDirection() {
		if (this.state.startLocationIndex === this.state.endLocationIndex) {
			this.loadMapByType()
			return;
		}

		const mapboxKey = await this.onGetMapBoxKey();

		let startLocationLat = this.state.startLocationIndex === 0 ? this.getOriginLatLong().originLat : this.getLatLongByIndex(this.state.startLocationIndex).lat;
		let startLocationLong = this.state.startLocationIndex === 0 ? this.getOriginLatLong().originLong : this.getLatLongByIndex(this.state.startLocationIndex).long;

		let endLocationLat = this.state.endLocationIndex === 0 ? this.getOriginLatLong().originLat : this.getLatLongByIndex(this.state.endLocationIndex).lat;
		let endLocationLong = this.state.endLocationIndex === 0 ? this.getOriginLatLong().originLong : this.getLatLongByIndex(this.state.endLocationIndex).long;

		if (mapboxKey) {
			this.onMapBoxDirection(
				mapboxKey,
				startLocationLat,
				startLocationLong,
				endLocationLat,
				endLocationLong,
			)
		} else {
			const geoProvider = await this.onGetGeoProvider();
			if (geoProvider === '1' || !geoProvider) {
				this.onStreetMapDirection(
					startLocationLat,
					startLocationLong,
					endLocationLat,
					endLocationLong,
				);
			} else {
				this.onGoogleMapDirection(
					startLocationLat,
					startLocationLong,
					endLocationLat,
					endLocationLong,
				);
			}
		}
	}

	async setup() {
		this.mapService = useService("map_widget_3in1/mapService");
		this.notificationService = useService("notification");
		this.state = useState({
			html_map_widget_direction_tag: markup('<div class="mapbox-container" id="mapbox0"></div>'),
			markersOnMap: [],

			// for direction
			startPoints: [],
			endPoints: [],
			startLocationIndex: 0,
			endLocationIndex: 0,
			directionsService: null,
			directionsRenderer: null,
		});
		this.map;
		this.markersOnMap = [];

		onWillStart(() => {
			try {
				this.loadMapLib();
				if (this.props.auto_direction_locations.length <= 0) {
					this.loadDirectionPointList();
				} else {
					this.loadAutoDirection();
				}
			} catch (err) {
				console.log("1n1t err: ", err);
			}
		});

		onWillUpdateProps(async () => {
			if (this.props.auto_direction_locations.length <= 0) {
				if (this.map) { await this.onDrawMarker(); }
			} else {
				await this.onPressDirection();
			}
		})

		onMounted(async () => {
			await this.loadMapByType().then(async () => {
				if (this.props.auto_direction_locations.length > 0) {
					await this.onPressDirection();
				}
			})
		})

		onError(() => {
			console.log("MWD hook err");
		})
	}

	loadAutoDirection() {
		if (this.props.auto_direction_locations.length > 0) {
			const startLocationIndex = this.props.auto_direction_locations[0];
			const endLocationIndex = this.props.auto_direction_locations[1];

			if (startLocationIndex === endLocationIndex) {
				return;
			}

			this.state.startLocationIndex = startLocationIndex;
			this.state.endLocationIndex = endLocationIndex;
		}
	}

	loadDirectionPointList() {
		const originLocationTitle = this?.props?.origin_marker_title || "Origin Location";
		let locationList = [{index: 0, title: originLocationTitle}];
		const props = this.props;
		for (let i = 1; i < this?.props?.number_of_location; i++) {
			const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`
			locationList.push({
				index: i,
				title: markerTitleByIndex,
			});
		}
		this.state.startPoints = locationList;
		this.state.endPoints = locationList;
	}

	async onMapBoxDirection(mapboxKey, startLat, startLong, endLat, endLong) {
		const responseDirection = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${startLong},${startLat};${endLong},${endLat}?geometries=geojson&access_token=${mapboxKey}`);
		await responseDirection.json().then((response) => {
			this.onLoadMapBox().then(() => {
				this.onDrawMarker();
				const coordinates = response?.routes[0]?.geometry?.coordinates;
				this.map.on('load', () => {
					this.map.addSource('route', {
						'type': 'geojson',
						'data': {
							'type': 'Feature',
							'properties': {},
							'geometry': {
								'type': 'LineString',
								'coordinates': coordinates
							}
						}
					});
					this.map.addLayer({
						'id': 'route',
						'type': 'line',
						'source': 'route',
						'layout': {
							'line-join': 'round',
							'line-cap': 'round'
						},
						'paint': {
							'line-color': '#FF0000',
							'line-width': 8
						}
					});
				});
			});
		});
	}

	async onStreetMapDirection(startLat, startLong, endLat, endLong) {
		const streetMapLoadInterval = setTimeout(() => {
			this.onLoadStreetMap();
			const control = L.Routing.control({
				waypoints: [
					L.latLng(startLat, startLong),   // Starting point coordinates
					L.latLng(endLat, endLong)      // Endpoint coordinates
				],
				show: false
			}).addTo(this.map);
			control.hide();
			clearTimeout(streetMapLoadInterval);
		}, 1200)
	}

	async onGoogleMapDirection(startLat, startLong, endLat, endLong) {
		await this.onDrawMarker();
		if (directionsRenderer) { directionsRenderer?.setMap(null); }
		directionsService = new window.google.maps.DirectionsService();
		directionsRenderer = new window.google.maps.DirectionsRenderer({ map: this.map });
		const request = {
			origin: new window.google.maps.LatLng(startLat, startLong),
			destination: new window.google.maps.LatLng(endLat, endLong),
			travelMode: window.google.maps.TravelMode.DRIVING,
			provideRouteAlternatives: true
		};
		directionsService.route(request, function (result, status) {
			if (status == window.google.maps.DirectionsStatus.OK) {
				directionsRenderer.setDirections(result);
			}
		});
	}

	async loadMapLib() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			const htmlRenderMap = `<div class="map-container" id="map${this.props.map_id}" style="${this.props.style}"></div>`;
			this.state.html_map_widget_direction_tag = markup(htmlRenderMap);
			if (mapboxKey) {
				Promise.all([
					loadJS("/map_widget_3in1/static/lib/map_box/map_box.js"),
					loadCSS("/map_widget_3in1/static/lib/map_box/map_box.css"),
					loadCSS("/map_widget_3in1/static/lib/map_box/map_box_geo.css"),
					loadJS("/map_widget_3in1/static/lib/map_box/map_box_geo.min.js"),
				])
				return;
			} else {
				const geoProvider = await this.onGetGeoProvider();
				if (geoProvider === '1' || !geoProvider) {
					Promise.all([
						loadJS("/map_widget_3in1/static/lib/leaflet/leaflet.js"),
						loadCSS("/map_widget_3in1/static/lib/leaflet/leaflet.css"),
						loadJS("/map_widget_3in1/static/lib/leaflet/leaflet-routing.js"),
						loadCSS("/map_widget_3in1/static/lib/leaflet/leaflet-routing.css"),
					])
					return;
				} else {
					const ggMapKey = await this.onGetGGMapKey();
					if (ggMapKey) {
						var script = document.createElement('script');
						script.src = `https://maps.googleapis.com/maps/api/js?key=${ggMapKey}&v=3&callback=dummy`
						script.async = true;
						document.head.appendChild(script);
						function dummy() { }
						window.dummy = dummy;
					} else {
						this.notificationService.add("Google Map Key is invalid.", { type: 'warning' });
					}
				}
			}
		} catch (e) {
			console.log("Map l1b err l0ad: ", e);
			this.notificationService.add("Can not load map, try again.", { type: 'warning' });
		}
	}

	async loadMapByType() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			if (mapboxKey) {
				this.onLoadMapBox().then(() => {
					this.onDrawMarker();
				});
				return;
			} else {
				const geoProvider = await this.onGetGeoProvider();
				if (geoProvider === '1') {
					const streetMapLoadInterval = setTimeout(() => {
						this.onLoadStreetMap();
						clearTimeout(streetMapLoadInterval);
					}, 1200)
					return;
				} else {
					const ggMapLoadInterval = setTimeout(() => {
						this.onLoadGGMap();
						clearTimeout(ggMapLoadInterval);
					}, 1200)
					return;
				}
			}
		} catch (e) {
			console.log("Map typ3 err l0ad: ", e);
		}
	}

	async onLoadMapBox() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			const originLocation = this.getOriginLatLong();
			const mapId = `map${this.props.map_id}`;
			mapboxgl.accessToken = mapboxKey;
			// https://docs.mapbox.com/help/glossary/zoom-level/
			if (this.map) { this.map.remove() }
			this.map = new mapboxgl.Map({
				container: mapId,
				style: 'mapbox://styles/mapbox/streets-v11',
				center: [originLocation.originLong, originLocation.originLat],
				zoom: this.props.zoomLevel || 8,
				renderWorldCopies: false,
			});
			this.map.addControl(new mapboxgl.NavigationControl());
			return;
		} catch (e) {
			console.log("Map l0ad err");
			this.notificationService.add("Can not load MapBox, try again.", { type: 'warning' });
		}
	}

	onLoadStreetMap() {
		try {
			const originLocation = this.getOriginLatLong();
			if (this.map) { this.map.remove() }
			this.map = L.map(`map${this.props.map_id}`, { zoomControl: true, zoom: 1, zoomAnimation: false, fadeAnimation: true, markerZoomAnimation: true, maxBoundsViscosity: 1.0 }).setView([originLocation.originLat, originLocation.originLong], this.props.zoomLevel || 8);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(this.map);
			this.onDrawMarker();
			return;
		} catch (e) {
			console.log("StreetMap l0ad err: ", e);
			this.notificationService.add("Can not load OpenStreetMap, try again.", { type: 'warning' });
		}
	}

	async onLoadGGMap() {
		try {
			const originLocation = this.getOriginLatLong();
			var myLatLng = {
				lat: parseFloat(originLocation.originLat),
				lng: parseFloat(originLocation.originLong)
			};
			this.map = new window.google.maps.Map(window.document.getElementById(`map${this.props.map_id}`), {
				zoom: parseInt(this.props.zoomLevel) || 8,
				center: myLatLng
			});
			this.onDrawMarker();
			return;
		} catch (e) {
			console.log("GoogleMap l0ad err: ", e);
			this.notificationService.add("Can not load GoogleMap, try again.", { type: 'warning' });
		}
	}

	async onDrawMarker() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			const originLocation = this.getOriginLatLong();
			const originMarkerTitle = this.props.origin_marker_title || "Origin Location";
			let markers = [];
			if (mapboxKey) {
				if (this.state.markersOnMap) {
					this.state.markersOnMap.filter((marker) => {
						marker.remove();
					})
				}
				const props = this.props
				const originMarker = new mapboxgl.Marker()
					.setLngLat([originLocation.originLong, originLocation.originLat])
					.setPopup(
						new mapboxgl.Popup({ offset: 25 })
							.setHTML(`<p>${originMarkerTitle}</p>`)
					)
					.addTo(this.map);
				this.map.setCenter([originLocation.originLong, originLocation.originLat]);
				markers.push(originMarker);
				for (let i = 1; i < this.props.number_of_location; i++) {
					const locationLatLong = this.getLatLongByIndex(i);
					const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`
					if (locationLatLong.lat && locationLatLong.long) {
						const orderMarker = new mapboxgl.Marker()
							.setLngLat([locationLatLong.long, locationLatLong.lat])
							.setPopup(
								new mapboxgl.Popup({ offset: 25 })
									.setHTML(`<p>${markerTitleByIndex}</p>`)
							)
							.addTo(this.map);
						markers.push(orderMarker);
					}
				}
				this.state.markersOnMap = markers;
				return;
			} else {
				const geoProvider = await this.onGetGeoProvider();
				if (geoProvider === '1' || !geoProvider) {
					if (this.state.markersOnMap) {
						this.state.markersOnMap.filter((marker) => {
							this.map && this.map.removeLayer(marker);
						})
					}
					const props = this.props
					const originMarker = L.marker([originLocation.originLat, originLocation.originLong])
						.addTo(this.map)
						.bindPopup(originMarkerTitle)
						.openPopup();
					markers.push(originMarker);
					for (let i = 1; i < this.props.number_of_location; i++) {
						const locationLatLong = this.getLatLongByIndex(i);
						const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`
						if (locationLatLong.lat && locationLatLong.long) {
							const orderMarker = L.marker([locationLatLong.lat, locationLatLong.long])
								.addTo(this.map)
								.bindPopup(markerTitleByIndex)
								.openPopup();
							markers.push(orderMarker);
						}
					}
					this.state.markersOnMap = markers;
					return;
				} else {
					if (this.markersOnMap) {
						this.markersOnMap.filter((marker) => {
							marker.setMap(null);
						})
					}
					const props = this.props
					const originLatLng = {
						lat: parseFloat(originLocation.originLat),
						lng: parseFloat(originLocation.originLong)
					};
					const originMarker = new window.google.maps.Marker({
						position: originLatLng,
						title: originMarkerTitle,
						map: this.map,
					});
					markers.push(originMarker);
					for (let i = 1; i < this.props.number_of_location; i++) {
						const locationLatLong = this.getLatLongByIndex(i);
						const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`;
						if (locationLatLong.lat && locationLatLong.long) {
							const orderLatLng = {
								lat: parseFloat(locationLatLong.lat),
								lng: parseFloat(locationLatLong.long)
							};
							const orderMarker = new window.google.maps.Marker({
								position: orderLatLng,
								title: markerTitleByIndex,
								map: this.map,
							});
							markers.push(orderMarker);
						}
					}
					this.markersOnMap = markers;
					return;
				}
			}
		} catch (e) {
			console.log("Draw mark3r err0r", e);
		}
	}
}

MapWidgetDirection.template = "map_widget_direction.MapWidget";
MapWidgetDirection.extractProps = ({ attrs }) => {
	const {
		origin_long, origin_lat, number_of_location = 0,
		map_id = 0, origin_marker_title = "", style = "", zoomLevel = 8,
		auto_direction_locations="",
	} = attrs;
	const numb_of_location = parseInt(number_of_location);
	let locationList = {};
	if (number_of_location > 0) {
		for (let i = 1; i < numb_of_location; i++) {
			const latObj = { [`lat${i}`]: attrs[`lat${i}`] }
			const longObj = { [`long${i}`]: attrs[`long${i}`] }
			locationList = { ...locationList, ...latObj, ...longObj }
		}
	}
	return {
		...attrs,
		...locationList,
		map_id: parseInt(map_id),
		origin_long, origin_lat,
		number_of_location: numb_of_location,
		origin_marker_title: origin_marker_title,
		style: style,
		zoomLevel: zoomLevel,
		auto_direction_locations: auto_direction_locations?.split(',').map( Number ),
	};
};
registry.category("view_widgets").add("map_widget_3in1_direction", MapWidgetDirection);