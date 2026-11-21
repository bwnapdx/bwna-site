// Map coordinates for event addresses, keyed by the exact `address` string used in
// event frontmatter. Event pages show a map when their address is listed here.
// A venue is either a point or a street segment (for street fairs, block parties).
// Coordinates from OpenStreetMap (Nominatim / Overpass).

export type LatLng = [number, number];
export type Venue = { point: LatLng } | { line: LatLng[] };

export const venues: Record<string, Venue> = {
  // Beaumont-Wilshire
  'NE 44th Ave & Fremont St, Portland, OR': { point: [45.54830, -122.61835] },              // Beaumont Crossing plaza
  '4300 NE Fremont St, Suite 150, Portland, OR': { point: [45.54815, -122.61826] },        // Sylvan Learning
  '4110 NE Fremont St, Portland, OR': { point: [45.54822, -122.62056] },
  'NE 33rd Ave & Skidmore St, Portland, OR': { point: [45.55292, -122.62812] },            // Wilshire Park
  'NE 42nd Ave & NE Alameda St, Portland, OR': { point: [45.54424, -122.61944] },
  'NE Fremont St, Portland, OR': { line: [[45.54830, -122.62074], [45.54827, -122.61147]] },  // Beaumont Village, NE 41st–50th
  'NE Skidmore St & NE 35th Pl, Portland, OR': { line: [[45.55368, -122.62764], [45.55368, -122.62556]] },  // block party, NE 35th Pl–37th

  // Elsewhere
  '5535 NE Fremont St, Portland, OR': { point: [45.54835, -122.60983] },
  '5830 NE Alameda St, Portland, OR': { point: [45.54199, -122.60312] },
  '5626 NE Alameda St, Portland, OR': { point: [45.54232, -122.60562] },
  '2620 NE Fremont St, Portland, OR': { point: [45.54802, -122.63868] },
  'NE 52nd Ave & NE Sandy Blvd, Portland, OR': { point: [45.54011, -122.60999] },
  'NE 33rd Ave & NE US Grant Pl, Portland, OR': { point: [45.53933, -122.62953] },         // Grant Park
  'NE Killingsworth & 30th Ave, Portland, OR': { point: [45.56271, -122.63493] },          // Concordia Commons
  '5431 NE 20th Ave, Portland, OR': { point: [45.56242, -122.64514] },
  '8440 N Interstate Ave, Portland, OR': { point: [45.58434, -122.68643] },
  '5000 N Willamette Blvd, Portland, OR': { point: [45.57368, -122.72829] },
};
