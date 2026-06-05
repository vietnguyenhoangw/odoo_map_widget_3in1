# Odoo Map Widget (3 in 1) for Odoo V16

A powerful and flexible map widget for Odoo V16 that provides three integrated mapping capabilities in a single, easy-to-use package.

## Overview

This module extends Odoo V16 with a comprehensive mapping solution that combines three essential map functionalities:

1. **Google Maps Integration** - Display and interact with Google Maps
2. **OpenStreetMap Integration** - Open-source mapping alternative with full customization
3. **Leaflet Maps Support** - Feature-rich mapping library for advanced visualizations

Perfect for businesses that need to visualize location data, manage addresses, route planning, or geographical data analysis within their Odoo environment.

## Features

- 🗺️ **Multiple Map Providers** - Choose from Google Maps, OpenStreetMap, or Leaflet
- 📍 **Location Display** - Mark and display multiple locations on maps
- 🔍 **Interactive Controls** - Zoom, pan, and search capabilities
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚙️ **Easy Configuration** - Simple setup and integration with Odoo models
- 🎨 **Customizable UI** - Adapt the map widget to your brand and needs

## Compatibility

- **Odoo Version**: V16
- **Python**: 3.8+
- **JavaScript**: ES6+
- **Browsers**: All modern browsers (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone or download this module into your Odoo addons directory:
```bash
git clone https://github.com/vietnguyenhoangw/odoo_map_widget_3in1.git
```

2. Restart your Odoo server

3. Go to Apps and search for "Map Widget" or "Odoo Map Widget (3 in 1)"

4. Click Install

## Quick Start

After installation, the map widget will be available in your Odoo forms. You can:

- Add map fields to your models
- Select your preferred map provider
- Configure map settings through Odoo's standard interface
- Display location data automatically on forms

## Usage

### For Developers

Include the map widget in your form views:

```xml
<field name="location" widget="map" />
```

### Configuration

Configure map providers and API keys through Odoo's Settings or directly in your form definitions.

## Support & Documentation

For detailed documentation, examples, and troubleshooting, please refer to the repository's wiki or contact the maintainers.

## License

This project is licensed under the LGPL License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Author

**vietnguyenhoangw**  
[GitHub Profile](https://github.com/vietnguyenhoangw)

---

**Note**: This module requires proper API keys for Google Maps integration and appropriate permissions for other map providers.
