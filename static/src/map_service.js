/** @odoo-module */

import { registry } from "@web/core/registry";
import rpc from 'web.rpc';

export const mapService = {
  dependencies: ["rpc", "orm"],
  async start(env, { orm }) {

    async function getMapBoxKey() {
      return await rpc.query({
        model: 'ir.config_params',
        method:'get_token_map_box',
      });
    }
    
    async function getGeoProvider() {
      return await rpc.query({
        model: 'ir.config_params',
        method:'get_geo_provider',
      });
    }
    
    async function getGGMapKey() {
      return await rpc.query({
        model: 'ir.config_params',
        method:'get_gg_map_key',
      });
    }

    return { getMapBoxKey: getMapBoxKey, getGeoProvider: getGeoProvider, getGGMapKey: getGGMapKey };
  },
};

registry.category("services").add("odoo_map_widget_3in1/mapService", mapService);