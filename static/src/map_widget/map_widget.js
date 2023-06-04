/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { loadJS, loadCSS } from "@web/core/assets";

const { 
	Component, useState, onWillStart, markup, 
	onError, onMounted, onWillUpdateProps } = owl;

class MapWidget extends Component {
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
			this.notificationService.add("Can not load map try again.", { type: 'warning' });
		}
		return mapType;
	}

	async onGetGGMapKey() {
		const ggMapKey = await this.mapService.getGGMapKey();
		if (!ggMapKey) {
			this.notificationService.add("Google API KEY is invalid.", { type: 'warning' });
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

	async setup() {
		this.mapService = useService("map_widget/mapService");
		this.notificationService = useService("notification");
		this.state = useState({
			html_map_widget_tag: markup('<div class="mapbox-container" id="mapbox0"></div>'),
			locationIndexList: [],
			markersOnMap: [],
		});
		this.map;

		onWillStart(() => {
			try {
				this.loadMapLib();
			} catch (err) {
				console.log("1n1t err: ", err);
			}
		});
		
		onWillUpdateProps(async () => {
			if (this.map) { await this.onDrawMarker(); }
		})

		onMounted(async () => {
			await this.loadMapByType()
		})

		onError(() => {
			console.log("MWD hook err");
		})		
	}

	async loadMapLib() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			const htmlRenderMap = `<div class="map-container" id="map${this.props.map_id}" style="${this.props.style}"></div>`;
			this.state.html_map_widget_tag = markup(htmlRenderMap);
			if (mapboxKey) {
				Promise.all([
					loadJS("/map_widget/static/lib/map_box/map_box.js"),
					loadCSS("/map_widget/static/lib/map_box/map_box.css"),
					loadCSS("/map_widget/static/lib/map_box/map_box_geo.css"),
					loadJS("/map_widget/static/lib/map_box/map_box_geo.min.js"),
				])
				return;
			} else {
				const geoProvider = await this.onGetGeoProvider();
				if (geoProvider === '1') {
					Promise.all([
						loadJS("/odoo_js_training/static/lib/leaflet/leaflet.js"),
						loadCSS("/odoo_js_training/static/lib/leaflet/leaflet.css"),
					])
					return;
				} else {
					const ggMapKey = await this.onGetGGMapKey();
					var script = document.createElement('script');
					script.src = `https://maps.googleapis.com/maps/api/js?key=${ggMapKey}&v=3&callback=dummy`
					script.async = true;
					document.head.appendChild(script);
					function dummy() {}
					window.dummy=dummy;
				}
			}
		} catch (e) {
			console.log("Map l1b err l0ad: ", e);
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
			this.notificationService.add("Can not load mapbox, try again.", { type: 'warning' });
		}
	}
	
	onLoadStreetMap() {
		try {
			const originLocation = this.getOriginLatLong();
			if (this.map) { this.map.remove() }
			this.map = L.map(`map${this.props.map_id}`).setView([originLocation.originLat, originLocation.originLong], 13);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(this.map);
			this.onDrawMarker();
			return;
		} catch (e) {
			console.log("StreetMap l0ad err: ", e);
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
				zoom: 15,
				center: myLatLng
			});
			this.onDrawMarker();
			return;
		} catch (e) {
			console.log("GoogleMap l0ad err: ", e);
		}
	}
	
	clearMarker() {
		if (this.state.markersOnMap) {
			this.state.markersOnMap.filter((marker) => {
				marker.remove();
			})
		}
	}
	
	async onDrawMarker() {
		try {
			const mapboxKey = await this.onGetMapBoxKey();
			const originLocation = this.getOriginLatLong();
			const originMarkerTitle = this.props.origin_marker_title || "Origin Location";
			let markers = [];
			if (mapboxKey) {
				this.clearMarker();
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
					if (locationLatLong.lat || locationLatLong.long) {
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
				if (geoProvider === '1') {
					const props = this.props
					L.marker([originLocation.originLat, originLocation.originLong])
						.addTo(this.map)
						.bindPopup(originMarkerTitle)
						.openPopup();
					for (let i = 1; i < this.props.number_of_location; i++) {
						const locationLatLong = this.getLatLongByIndex(i);
						const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`
						L.marker([locationLatLong.lat, locationLatLong.long])
							.addTo(this.map)
							.bindPopup(markerTitleByIndex)
							.openPopup();
					}
					return;
				} else {
					const props = this.props
					const myLatLng = {
						lat: parseFloat(originLocation.originLat),
						lng: parseFloat(originLocation.originLong)
					};
					new window.google.maps.Marker({
						position: myLatLng,
						title: originMarkerTitle,
						map: this.map,
					});
					for (let i = 1; i < this.props.number_of_location; i++) {
						const locationLatLong = this.getLatLongByIndex(i);
						const markerTitleByIndex = props[`marker_title${i}`] || `Location ${i}`
						const myLatLng = {
							lat: parseFloat(locationLatLong.lat),
							lng: parseFloat(locationLatLong.long)
						};
						new window.google.maps.Marker({
							position: myLatLng,
							title: markerTitleByIndex,
							map: this.map,
						});
					}
					return;
				}
			}
		} catch (e) {
			console.log("Draw mark3r err0r", e);
		}
	}
}

MapWidget.template = "map_widget.MapWidget";
MapWidget.extractProps = ({ attrs }) => {
	const {
		origin_long, origin_lat, number_of_location = 0,
		map_id = 0, origin_marker_title = "", style = "", zoomLevel = 8,
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
	};
};
registry.category("view_widgets").add("map_widget", MapWidget);