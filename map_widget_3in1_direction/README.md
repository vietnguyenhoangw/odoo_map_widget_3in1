
# :world_map: Map Widget (3 in 1) Direction - Odoo V16

### Easy Map Widget with direction feature integration.
<b>:rotating_light:Noticed: </b> For using this direction feature, you need to integrate <b>[map_widget_3in1](https://developers.google.com/maps/documentation/javascript/get-api-key)</b> addon first.

## Demo
<img src="./static/description/rec1.gif" width="500" title="map-box"><img src="./static/description/rec2.gif" width="500" title="street-map"><img src="./static/description/rec3.gif" width="500" title="google-map">

## Installation

1. Put the <b>'map_widget_3in1_direction'</b> add-ons into your Odoo source code (same folder contain <b>map_widget_3in1</b>)

	<img src="./static/description/integrate_ex_0.png" width="500" title="map_widget-example">
 
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
#### To add widget map direction, you need to have more than 2 of locations ([read properties section - create dynamic location in map_widget_3in1](https://developers.google.com/maps/documentation/javascript/get-api-key))

We have 2 of ways to direction form first location to second location.</br>

<b>1. Auto direction (static direction)</b></br>
Everything you need to do is add values for <b>auto_direction_locations</b>, the map will always drirect from A to B following location index values without controller. The values is string with 2 of location's index.</br>
<b>Example:</b></br>
auto_direction_locations="0,1" (direction from original location to location1)</br>
auto_direction_locations="0,2" (direction from original location to location2)</br>
auto_direction_locations="1,2" (direction from location1 to location2)</br>
<img src="./static/description/integrate_ex_2.png" width="500" title="map_widget-example">

<b>2. Direction with controller </b></br>
Just remove <b>auto_direction_locations</b> properties. We can using dynamic direction with controller UI.

<img src="./static/description/controller1.png" width="500" title="map_widget-example">
<img src="./static/description/controller2.png" width="500" title="map_widget-example">
<img src="./static/description/controller3.png" width="500" title="map_widget-example">

## Properties
This <b>map_widget_3in1_direction</b> addons have common properties with <b>map_widget_3in1</b>, so you can read detail addons's properties <b>[here](https://developers.google.com/maps/documentation/javascript/get-api-key)</b>
| Function name  | Description               | Example value |
| --------------------- | ------------------------------|----------------------|
|auto_direction_locations    |  Static direction from location index A to location index B  | **(string)** ex: "0,1", "0,2", "1,2"...   |

## Credits & Support
- vietnguyenhoangw <[vietnguyenhoangw@gmail.com](vietnguyenhoangw@gmail.com)>
- Vu Nguyen Anh <[vuna2004@gmail.com](vuna2004@gmail.com)>
