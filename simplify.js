const turf = require("@turf/turf");

// Convert meters → degrees (approx at HK latitude)
function metersToDegrees(m) {
  return m / 111320;
}

function simplifyPolygonWithHoles(feature, toleranceDeg) {
  const geom = feature.geometry;

  if (geom.type !== "Polygon") return feature;

  const simplifiedRings = geom.coordinates.map((ring) => {
    const line = turf.lineString(ring);
    const simplified = turf.simplify(line, {
      tolerance: toleranceDeg,
      highQuality: true,
    });
    return simplified.geometry.coordinates;
  });

  return {
    ...feature,
    geometry: {
      type: "Polygon",
      coordinates: simplifiedRings,
    },
  };
}

function simplifyFeatureCollection(fc, toleranceDeg) {
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => simplifyPolygonWithHoles(f, toleranceDeg)),
  };
}

// Input from CLI
const input = JSON.parse(process.argv[2]);

// UI sends tolerance in METERS → convert to DEGREES
const toleranceMeters = input.tolerance || 2; // example default
const toleranceDeg = metersToDegrees(toleranceMeters);

const simplified = simplifyFeatureCollection(input, toleranceDeg);
console.log(JSON.stringify(simplified));
