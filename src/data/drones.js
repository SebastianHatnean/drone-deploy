/**
 * Calculate drone range based on battery level
 * @param {number} battery - Battery percentage (0-100)
 * @returns {number} Range in kilometers
 */
function calculateRange(battery) {
    if (battery < 25) return Math.floor(Math.random() * 6) + 5; // 5-10km
    if (battery < 50) return Math.floor(Math.random() * 11) + 10; // 10-20km
    return Math.floor(Math.random() * 21) + 20; // 20-40km
  }
  
  const drones = [
    // Standby drones (11 total - green markers)
    {
      id: 'DR-001-taxi-1',
      status: 'standby',
      battery: 92,
      name: 'Skyrunner X1 Taxi 1',
      range: calculateRange(92),
      load: 0,
      coordinates: { lat: 51.5080, lng: -0.1285 } // Slightly offset from Big Ben
    },
    {
      id: 'DR-001-taxi-2',
      status: 'standby',
      battery: 92,
      name: 'Skyrunner X1 Taxi 2',
      range: calculateRange(92),
      load: 0,
      coordinates: { lat: 51.5085, lng: -0.1280 } // Slightly offset from Big Ben
      },
      {
        id: 'DR-001-taxi-3',
        status: 'standby',
        battery: 92,
        name: 'Skyrunner X1 Taxi 3',
        range: calculateRange(92),
        load: 0,
        coordinates: { lat: 51.5080, lng: -0.1385 } // Slightly offset from Big Ben
      },
      {
        id: 'DR-001',
        status: 'standby',
        battery: 92,
        name: 'Skyrunner X1',
        range: calculateRange(92),
        load: 0,
        coordinates: { lat: 51.5074, lng: -0.1278 } // Near Big Ben
      },
    {
      id: 'DR-002',
      status: 'standby',
      battery: 88,
      name: 'Skyrunner X2',
      range: calculateRange(88),
      load: 0,
      coordinates: { lat: 51.5155, lng: -0.0922 } // Near Liverpool Street
    },
    {
      id: 'DR-003',
      status: 'standby',
      battery: 75,
      name: 'Skyrunner X1',
      range: calculateRange(75),
      load: 0,
      coordinates: { lat: 51.5045, lng: -0.0865 } // Near Tower Bridge
    },
    {
      id: 'DR-004',
      status: 'standby',
      battery: 95,
      name: 'Skyrunner X2',
      range: calculateRange(95),
      load: 0,
      coordinates: { lat: 51.5194, lng: -0.1270 } // Near Kings Cross
    },
    {
      id: 'DR-005',
      status: 'standby',
      battery: 67,
      name: 'Skyrunner X1',
      range: calculateRange(67),
      load: 0,
      coordinates: { lat: 51.5033, lng: -0.1195 } // Near Southwark
    },
    {
      id: 'DR-006',
      status: 'standby',
      battery: 81,
      name: 'Skyrunner X2',
      range: calculateRange(81),
      load: 0,
      coordinates: { lat: 51.5287, lng: -0.1025 } // Near Angel
    },
    {
      id: 'DR-007',
      status: 'standby',
      battery: 58,
      name: 'Skyrunner X1',
      range: calculateRange(58),
      load: 0,
      coordinates: { lat: 51.4975, lng: -0.1357 } // Near Waterloo
    },
    {
      id: 'DR-008',
      status: 'standby',
      battery: 90,
      name: 'Skyrunner X2',
      range: calculateRange(90),
      load: 0,
      coordinates: { lat: 51.5225, lng: -0.1559 } // Near Regent's Park
    },
    {
      id: 'DR-009',
      status: 'standby',
      battery: 73,
      name: 'Skyrunner X1',
      range: calculateRange(73),
      load: 0,
      coordinates: { lat: 51.5349, lng: -0.1245 } // Near Camden
    },
    {
      id: 'DR-010',
      status: 'standby',
      battery: 86,
      name: 'Skyrunner X2',
      range: calculateRange(86),
      load: 0,
      coordinates: { lat: 51.5134, lng: 0.0295 } // Near Canary Wharf
    },
    {
      id: 'DR-011',
      status: 'standby',
      battery: 78,
      name: 'Skyrunner X1',
      range: calculateRange(78),
      load: 0,
      coordinates: { lat: 51.4893, lng: -0.1441 } // Near Vauxhall
    },
  
    // Delivering drones (6 total - blue markers)
    {
      id: 'DR-012',
      status: 'delivering',
      battery: 62,
      name: 'Skyrunner X2',
      eta: '8 mins',
      range: calculateRange(62),
      load: 2,
      coordinates: { lat: 51.5145, lng: -0.1005 } // Near Shoreditch
    },
    {
      id: 'DR-013',
      status: 'delivering',
      battery: 71,
      name: 'Skyrunner X1',
      eta: '12 mins',
      range: calculateRange(71),
      load: 3,
      coordinates: { lat: 51.5321, lng: -0.1389 } // Near Euston
    },
    {
      id: 'DR-014',
      status: 'delivering',
      battery: 55,
      name: 'Skyrunner X2',
      eta: '15 mins',
      range: calculateRange(55),
      load: 1,
      coordinates: { lat: 51.4967, lng: -0.1743 } // Near Hyde Park
    },
    {
      id: 'DR-015',
      status: 'delivering',
      battery: 68,
      name: 'Skyrunner X1',
      eta: '6 mins',
      range: calculateRange(68),
      load: 4,
      coordinates: { lat: 51.5091, lng: -0.0755 } // Near Whitechapel
    },
    {
      id: 'DR-016',
      status: 'delivering',
      battery: 84,
      name: 'Skyrunner X2',
      eta: '10 mins',
      range: calculateRange(84),
      load: 2,
      coordinates: { lat: 51.5430, lng: -0.1058 } // Near Holloway
    },
    {
      id: 'DR-017',
      status: 'delivering',
      battery: 77,
      name: 'Skyrunner X1',
      eta: '5 mins',
      range: calculateRange(77),
      load: 3,
      coordinates: { lat: 51.4850, lng: -0.1015 } // Near Bermondsey
    },
  
    // Low battery drones (4 total - will show orange markers due to battery override)
    {
      id: 'DR-018',
      status: 'standby',
      battery: 18,
      name: 'Skyrunner X2',
      range: calculateRange(18),
      load: 0,
      coordinates: { lat: 51.5011, lng: -0.1419 } // Near Westminster
    },
    {
      id: 'DR-019',
      status: 'delivering',
      battery: 22,
      name: 'Skyrunner X1',
      eta: '3 mins',
      range: calculateRange(22),
      load: 1,
      coordinates: { lat: 51.5269, lng: -0.0815 } // Near Hoxton
    },
    {
      id: 'DR-020',
      status: 'standby',
      battery: 15,
      name: 'Skyrunner X2',
      range: calculateRange(15),
      load: 0,
      coordinates: { lat: 51.4982, lng: -0.1553 } // Near Victoria
    },
    {
      id: 'DR-021',
      status: 'standby',
      battery: 20,
      name: 'Skyrunner X1',
      range: calculateRange(20),
      load: 0,
      coordinates: { lat: 51.5476, lng: -0.1372 } // Near Kentish Town
    }
  ];
  
  export default drones;