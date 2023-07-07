
# :world_map: Map Widget (3 in 1) Direction - Odoo V16

### Easy Map Widget with direction feature integration.
<b>:rotating_light:Noticed: </b> For using this direction feature, you need to integrate <b>[map_widget_3in1](https://developers.google.com/maps/documentation/javascript/get-api-key)</b> addon first.

## Demo
<img src="./static/description/mapbox.gif" width="500" title="map-box"><img src="./static/description/streetmap.gif" width="500" title="street-map"><img src="./static/description/ggmap.gif" width="500" title="google-map">


## Installation

1. Put the <b>'map_widget_3in1_direction'</b> add-ons into your Odoo source code (same folder contain <b>map_widget_3in1</b>)
	<img src="./static/description/integrate_ex_0.png" width="200" title="map_widget-example">
2. Three options are prioritised as listed below.<br/>

	#### :pushpin: Mapbox
	**a.1.** If you want to display Mapbox, you need to register [Map Box](https://www.mapbox.com)'s API KEY<br/>
	**a.2.** Enter the Mapbox API KEY into **Setting**. And if you enter the Mapbox's API KEY, the map widget will always choose Mapbox to display first.

	![Screen Shot 2023-04-19 at 10 51 02 PM](https://user-images.githubusercontent.com/43869718/233131625-c6d2fcec-0e9d-4bf7-ad56-fb944b55d82f.png)

	#### :pushpin: Open Street Map
	**b.1.** If you want to display Street Map, just leave the Mapbox API KEY blank and tick into the **Geo Localization** option.<br/>
	**b.2.** Make sure **Geo Localization** API's option is **Open Street Map**

	![Screen Shot 2023-04-19 at 10 51 16 PM](https://user-images.githubusercontent.com/43869718/233131655-cf4f3041-a991-408e-ac4c-5a1c56cf1191.png)

	#### :pushpin: Google Map
	**c.1.** If you want to display Google Map, config following **b.1 step**. <br/>
	**c.2.** Make sure **Geo Localization** API's option is **Google Place Map**, and do not forget adding [Google API KEY](https://developers.google.com/maps/documentation/javascript/get-api-key)
	
    ![Screen Shot 2023-04-19 at 10 51 30 PM](https://user-images.githubusercontent.com/43869718/233132268-d1c89adf-ca93-42ba-af90-693c86232113.png)


3. Add <b>'map_widget_3in1_direction'</b> addons into your module depend you want to add map.
<img src="./static/description/integrate_ex_1.png" width="500" title="map_widget-example">

## Usage Example
To add widget map direction, you need to have more than 2 of locations ([read properties create dynamic location in map_widget_3in1](https://developers.google.com/maps/documentation/javascript/get-api-key))

















1. Add 2 fields are lat and long (following bellow example are main_latitude and main_longitude).
2. Create <widget> tag and add properties for this widget (Properties Detail). In below example we have props map_id, name, style, origin_lat and origin_long

<b>:triangular_flag_on_post:Noticed: </b> We need to define the field with lat and long first, then put the lat and long into map widget with the same name value.
<br/>
<img src="./static/description/integrate_ex_2.png" width="600" title="usage-example">


## Properties

| Function name  | Description               | Example value |
| --------------------- | ------------------------------|----------------------|
|map_id    | Map key id   | **(string number)** "0" is default value  |
|name   | Widget's name   | **(string)** must be add-ons's name "map_widget"   |
|origin_lat   | First location point **latitude** field name | **(string)** latitude field name in model  |
|origin_long   | First location point **longitude** field name  | **(string)** longitude field name in model  |
|style   | HTML style value  | **(string)** "width: 100vw; height: 70vh;..."  |
|zoomLevel   | **(string number)** map zoom level | **(string number)** "8" is default value https://docs.mapbox.com/help/glossary/zoom-level/ |

**If you want to add more than 1 location point, following bellow properties**

| Function name  | Description  |  Example value |
| ------------ | ------------ | ------------ |
|  number_of_location | Number of location you want to add in this map | **(string number)** because **origin_lat** and **origin_long** is the 1 of location, so if you want add more location, the value should be from **"2"**   |
|  lat1 | Second location point **latitude** field name  | **(string)** latitude field name in model   |
|  long1 |  Second location point **longitude** field name  | **(string)** longitude field name in model  |

And if you want add more than 2 location just define **number_of_location** (remember number of location must include the **origin location**) and add dynamic **lat** and **long** field name:  **lat1**, **long1**, **lat2**, **long2**, **lat3**, **long3**... (number of location you want to add is unlimited)
	
**If you want to custom title for marker**

| Function name  | Description  |  Example value |
| ------------ | ------------ | ------------ |
|  origin_marker_title | Custom origin location's marker title | **(string)** Name of location  |
|  marker_title1, marker_title2,... [marker_title{Number of index location}] | Custom dynamic location marker title  | **(string)**  Name of location  |

Similar add more than 1 location properties desciption above, If you want to custom any text title for marker. You just need to add field with number of location index: **marker_title1**,**marker_title2**,**marker_title3**... </br>
#### **Dynamic config example**
<img src="./static/description/integrate_ex_3.png" width="600" title="usage-example">

## Credits & Support
- vietnguyenhoangw <[vietnguyenhoangw@gmail.com](vietnguyenhoangw@gmail.com)>
- Vu Nguyen Anh <[vuna2004@gmail.com](vuna2004@gmail.com)>
