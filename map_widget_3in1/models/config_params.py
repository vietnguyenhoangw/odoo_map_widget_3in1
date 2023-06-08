from odoo import api, models

class ConfigParams(models.AbstractModel):
    _name = 'ir.config_params'
    _description = 'Config Parameters Access Method Definition'

    @api.model
    def get_token_map_box(self):
        return self.env['ir.config_parameter'].sudo().get_param('web_map.token_map_box')
        
    @api.model
    def get_geo_provider(self):
        return self.env['ir.config_parameter'].sudo().get_param('base_geolocalize.geo_provider')
        
    @api.model
    def get_gg_map_key(self):
        return self.env['ir.config_parameter'].sudo().get_param('base_geolocalize.google_map_api_key')
