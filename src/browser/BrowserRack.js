/*Copyright (C) 2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

import { Rack } from "../game/Rack.js";
import { SurfaceMixin } from "./SurfaceMixin.js";

/**
 * Browser-side {@linkcode Rack}
 * @extends Rack
 * @mixes browser/SurfaceMixin
 */
class BrowserRack extends SurfaceMixin(Rack) {
}

export { BrowserRack }
