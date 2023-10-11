/*Copyright (C) 2019-2022 The Xanado Project https://github.com/cdot/Xanado
  License MIT. See README.md at the root of this distribution for full copyright
  and license information. Author Crawford Currie http://c-dot.co.uk*/

const IB_ID = "_\u00CD";
const IB_CN = "_\u0106";
const IB_DATA = "_\u00D0";
const IB_REF = "_\u0154";

/**
 * OLD CODE, now maintained just for compatibility.
 * Use {@linkcode CBOR} instead.
 *
 * Simple serialisation/deserialisation of a JS object
 * graph to stand-alone JSON. Does not handle function
 * references. Full restoration of objects requires classes
 * to be passed in to thaw().
 *
 * Classes passed in can optionally define methods "Freeze()" and
 * "static Thaw()". Freeze must return frozen data for the object,
 * that will then be thawed by calling Thaw, which is passed the
 * frozen data. It is entirely up to the class how Freeze and Thaw
 * are implemented.
 *
 * The object properties above are reserved for use by this
 * module, and note also that fields who's names start with _ will
 * not be serialised.
 *
 * Note that the objects being frozen are 'interfered with' by the
 * addition of an IB_ID field that indicates their 'frozen ID'.
 * This is a (clumsy) solution to the lack of ES7 value objects in ES6.
 * The frozen version (JSONified) version of objects are decorated
 * with fields as follows:
 * IB_CN: constructor name
 * IB_REF: the IB_ID of another object being referenced
 * Date objects are serialised to string.
 *
 * If the class of an object has the UNFREEZABLE attribute, then
 * the name of that class won't be frozen. Instead the identifier of
 * the superclass will be used (ultimately, Object).
 * @deprecated since version 3.1.0
 */
class Fridge {

  /**
   * Convert an object graph to stand-alone JSON.
   * @param {object} object - object to freeze
   * @return {object} the frozen version of the object
   * @deprecated since version 3.1.0
   */
  static freeze(object) {
    const objectsFrozen = [];

    function _freeze(unfrozen) {
      // Can't/don't want to serialise functions
      /* c8 ignore start */
      if (typeof unfrozen === "function")
        throw Error("Can't freeze functions");
      /* c8 ignore stop */

      if (!unfrozen || typeof unfrozen !== "object")
        return unfrozen;

      // better way to handle arrays
      if (Array.isArray(unfrozen)) {
        return unfrozen.map(e => _freeze(e));
      }

      try {
        if (Object.prototype.hasOwnProperty.call(unfrozen, IB_ID)) {
          // ref to a previously frozen object
          if (unfrozen.constructor) {
            //console.debug(`Ref to ${unfrozen[IB_ID]} ${unfrozen.constructor.name}`);
            const ret = {}; ret[IB_REF] = unfrozen[IB_ID];
            return ret;
          }
        }
      /* c8 ignore start */
      } catch (e) {
        throw new Error("Corrupt fridge");
      }
      /* c8 ignore stop */
      const id = objectsFrozen.length;
      // Working property will be removed later
      Object.defineProperty(unfrozen, IB_ID, {
        configurable: true,
        value: id
      });
      objectsFrozen.push(unfrozen);

      const frozen = {};
      frozen[IB_ID] = id;

      if (unfrozen.constructor
          && unfrozen.constructor.name
          && unfrozen.constructor.name !== "Object")
      {
        let freezable = unfrozen.constructor;
        // The static UNFREEZABLE attribute on a class indicates that
        // the superclass should be used in the freeze
        while (freezable.UNFREEZABLE) {
          //console.log(freezable, "unfreezable");
          freezable = Object.getPrototypeOf(freezable);
          if (freezable.name === "Object")
            throw Error("Bottomless unfreezable chain");
        }
        frozen[IB_CN] = freezable.name;
      }

      const proto = Object.getPrototypeOf(unfrozen);
      if (proto && typeof proto.Freeze === "function") {
        frozen[IB_DATA] = unfrozen.Freeze();

      } else if (frozen[IB_CN] === "Date") {
        // Special handling because the fields are just noise
        frozen[IB_DATA] = unfrozen.getTime();
        return frozen;

      } else {
        frozen[IB_DATA] = {};
        for (let prop in unfrozen)
          // Exclude _* to avoid _events etc
          // Don't try to freeze code, might overwrite mixins
          if (!/^#?_/.test(prop) && typeof unfrozen[prop] !== "function") {
            try {
              frozen[IB_DATA][prop] = _freeze(unfrozen[prop]);
            /* c8 ignore start */
            } catch (e) {
              debugger;
            }
            /* c8 ignore stop */
          }
      }
      return frozen;
    }

    const frozen = _freeze(object);
    // Clean out temporary fields used in freezing
    for (let uf of objectsFrozen)
      delete uf[IB_ID];

    return JSON.stringify(frozen, null, 1);
  }

  /**
   * Expand a frozen structure. During freezing, the
   * constructor name for each frozen object is recorded. During
   * thawing, that constructor name has to be mapped to a
   * prototype. If a useable constructor is not found, a
   * warning will be printed to the console.
   * @param {string|buffer} json JSON of object to thaw
   * @param {object.<string,object>} typeMap optional map from class name
   * to class for objects expected within frozen data.
   * @deprecated since version 3.1.0
   */
  static thaw(json, typeMap) {
    const objectsThawed = [];

    function _thaw(object) {
      if (!object || typeof object !== "object")
        return object;

      if (Array.isArray(object)) {
        return object.map(e => _thaw(e));
      }

      if (Object.prototype.hasOwnProperty.call(object, IB_REF)) {
        // Reference to another object, that must already have
        // been thawed
        if (objectsThawed[object[IB_REF]])
          return objectsThawed[object[IB_REF]];
        /* c8 ignore next */
        throw new Error(`reference to unthawed ${object[IB_REF]}`);
      }

      let thawed, thawProps = false;
      let clzz = typeMap[object[IB_CN]];
      if (object[IB_CN] === "Date")
        // Special handling because we just serialise an integer
        return new Date(object[IB_DATA]);

      else if (clzz) {
        if (typeof clzz.Thaw === "function")
          thawed = clzz.Thaw(object[IB_DATA]);
        else {
          thawed = Object.create(clzz.prototype);
          thawProps = true;
        }

      } else {
        if (object[IB_CN])
          throw Error(`${object[IB_CN]} missing from type map`);
        thawed = {};
        thawProps = true;
      }

      if (Object.prototype.hasOwnProperty.call(object, IB_ID))
        objectsThawed[object[IB_ID]] = thawed;

      if (thawProps)
        for (let prop in object[IB_DATA]) {
          thawed[prop] = _thaw(
            object[IB_DATA][prop], objectsThawed);
        }

      return thawed;
    }

    const object = JSON.parse(json);
    return _thaw(object);
  }
}

export { Fridge }
