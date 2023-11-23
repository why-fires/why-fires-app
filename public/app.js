let is3D = false;
document.getElementById('toggle3D').addEventListener('click', function() {
  is3D = !is3D; // Toggle the is3D flag
  loadYearData(document.getElementById('yearSlider').value);
});

d3.select('#d3Div').append('svg').attr('width', 300).attr('height', 200)
    .append('circle').attr('cx', 150).attr('cy', 100).attr('r', 40).attr('fill', 'blue');

const typeMapping = {
  '0': 'Presumed Vegetation Fire',
  '1': 'Active Volcano',
  '2': 'Other Static Land Source',
  '3': 'Offshore'
};

const dayNightMapping = {
  'D' : 'Daytime fire',
  'N' : 'Nighttime fire'
}

function filterData(data) {
  let filteredData = data;
  const stateFilter = document.getElementById('stateFilter').value;
  const dayNightFilter = document.getElementById('dayNightFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;
  const monthFilter = document.getElementById('monthFilter').value;

  if (stateFilter) {
    filteredData = filteredData.filter(d => d.state_name === stateFilter);
  }
  if (dayNightFilter) {
    filteredData = filteredData.filter(d => d.daynight === dayNightFilter);
  }
  if (typeFilter) {
    filteredData = filteredData.filter(d => d.type === typeFilter);
  }
  if (dateFilter) {
    filteredData = filteredData.filter(d => d.acq_date === dateFilter);
  }
  if (monthFilter) {
    filteredData = filteredData.filter(d => {
      const month = new Date(d.acq_date).getMonth() + 1;
      return month.toString() === monthFilter;
    });
  }
  return filteredData;
}

function loadYearData(year) {
  const dataPath = `./data/modis_${year}_United_States.csv`;
  let currentLayout = getPlotlyLayout('mapContainer');
  let currentCenter = currentLayout.center;
  let currentZoom = currentLayout.zoom;

  // Set the min and max dates for the date input
  const minDate = `${year}-01-01`; // first day of the year
  const maxDate = `${year}-12-31`; // last day of the year
  document.getElementById('dateFilter').setAttribute('min', minDate);
  document.getElementById('dateFilter').setAttribute('max', maxDate);

  d3.csv(dataPath).then((data) => {
    let filteredData = filterData(data);
    updateDataCount(filteredData.length);
    createGeoGraph(filteredData.slice(0,50), currentZoom, currentCenter); // remove .slice(0,50)
  });
}

document.getElementById('yearSlider').addEventListener('input', function(e) {
  const year = e.target.value;
  document.getElementById('yearDisplay').textContent = year;
  loadYearData(year);
});

loadYearData(document.getElementById('yearSlider').value);

document.getElementById('stateFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
document.getElementById('dayNightFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
document.getElementById('typeFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
document.getElementById('dateFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
document.getElementById('monthFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));

function createGeoGraph(data, currentZoom, currentCenter) {
  if (is3D) {
    create3DMap(data, currentZoom, currentCenter);
  } else {
    create2DMap(data, currentZoom, currentCenter);
  }
}

function create2DMap(data, currentZoom, currentCenter) {
  let trace = [
    {
      type: 'scattermapbox',
      mode: 'markers',
      lat: data.map(d => d.latitude),
      lon: data.map(d => d.longitude),
      // z: [743, 257, 653, 541, 845],
      text: data.map(d => getDetail(d)),
      marker: {
        color: 'red',
        size: 10,
        // size: [100, 54, 28, 74, 36], //10
        // sizemode: "area",
        // sizeref: 3,
        opacity: 0.8
      },
      // extrude: [50, 100, 75]
      // angle: [38, 75, 48, 53, 92]
    }
  ];

  let layout = {
    mapbox: {
      style: 'carto-positron',
      center: currentCenter || { lat: 37.0902, lon: -95.7129 },
      zoom: currentZoom || 3,
      // pitch: 45,
      // bearing: -25
    },
    height: 1000,
  };

  Plotly.newPlot('mapContainer', trace, layout);

  mapContainer.on('plotly_click', function(data){
    var infotext = data.points[0].data.text[data.points[0].pointIndex];

    var detailsBox = document.getElementById('detailBox');
    detailsBox.style.display = 'block';
    detailsBox.innerHTML = infotext;
  });
}

function create3DMap(data, currentZoom, currentCenter) {
  //const container = document.getElementById('mapContainer');
  //container.innerHTML = '';

  const filePath = './data/US_State_Boundaries.geojson';
  const filePathSmall = './data/US_States_20m.json'; // Source: https://eric.clst.org/tech/usgeojson/

// fetch(italy)
//     .then(response => response.json())
//     .then(geojson => {
//         // Extract points defining boundaries of polygons
//         const pts = [];
//         for (const feature of geojson.features) {
//             if (feature.geometry.type === 'Polygon') {
//                 pts.push(...feature.geometry.coordinates[0]);
//                 pts.push([null, null]); // Mark the end of a polygon
//             } else if (feature.geometry.type === 'MultiPolygon') {
//                 for (const polyg of feature.geometry.coordinates) {
//                     pts.push(...polyg[0]);
//                     pts.push([null, null]); // End of polygon
//                 }
//             } else {
//                 console.log("Unsupported geometry type:", feature.geometry.type);
//             }
//         }

//         const [x, y] = zip(...pts);
//         const z = new Array(x.length).fill(0);

//         let mapTrace = {
//           x: x,
//           y: y,
//           z: z,
//           mode: 'lines',
//           line: {
//             color: '#999999',
//             width: 1.5
//           },
//           type: 'scatter3d',
//         };

//         let firesTrace = {
//           type: 'scatter3d',
//           mode: 'markers',
//           y: data.map(d => d.latitude),
//           x: data.map(d => d.longitude),
//           z: data.map(d => d.brightness),
//           text: data.map(d => getDetail(d)),
//           marker: {
//             color: 'red',
//             size: 10,
//             opacity: 0.8
//           }
//         };

//         // Show the plot
//         Plotly.newPlot('mapContainer', [mapTrace, firesTrace]);
//     })
//     .catch(error => console.error("Error loading GeoJSON:", error));

const scaleFactor = 1.5;

fetch(filePathSmall)
    .then(response => response.json())
    .then(geojson => {
        // Extract points defining boundaries of polygons
        const pts = [];
        const processCoordinates = (coordinates) => {
          for (const coord of coordinates) {
              if (Array.isArray(coord[0])) {
                  // Recursive call for MultiPolygon
                  processCoordinates(coord);
              } else {
                  pts.push(coord);
              }
          }
          // Mark the end of a polygon
          pts.push([null, null]);
      };

      for (const feature of geojson.features) {
        const coordinates = feature.geometry.coordinates;
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            processCoordinates(coordinates);
        } else {
            console.log("Unsupported geometry type:", feature.geometry.type);
        }
    }

        const [x, y] = zip(...pts);
        const z = new Array(x.length).fill(0);

        // Apply scaling factor to map coordinates
        // const scaledXMap = x.map(xVal => xVal * scaleFactor);
        // const scaledYMap = y.map(yVal => yVal * scaleFactor);

        let mapTrace = {
          x: x,
          y: y,
          // x: scaledXMap,
          // y: scaledYMap,
          z: z,
          mode: 'lines',
          line: {
            color: '#999999',
            width: 1.5
          },
          type: 'scatter3d',
        };

        let firesTrace = {
          type: 'scatter3d',
          mode: 'markers',
          y: data.map(d => d.latitude * scaleFactor),
          x: data.map(d => d.longitude * scaleFactor),
          z: data.map(d => d.brightness),
          text: data.map(d => getDetail(d)),
          marker: {
            color: 'red',
            size: 5,
            opacity: 0.8
          }
        };

        // Show the plot
        Plotly.newPlot('mapContainer', [mapTrace, firesTrace]);
    })
    .catch(error => console.error("Error loading GeoJSON:", error));


  // let trace = [
  //   {
  //     type: 'scatter3d',
  //     mode: 'markers',
  //     y: data.map(d => d.latitude),
  //     x: data.map(d => d.longitude),
  //     z: data.map(d => d.brightness),
  //     text: data.map(d => getDetail(d)),
  //     marker: {
  //       color: 'red',
  //       size: 10,
  //       opacity: 0.8
  //     }
  //   }
  // ];

  // const layout = {
  //   mapbox: {
  //     style: 'carto-positron',
  //     center: currentCenter || { lat: 37.0902, lon: -95.7129 },
  //     zoom: currentZoom || 3,
  //     pitch: 45,
  //     bearing: -25
  //   },
  // };

  
  // Plotly.newPlot('mapContainer', fig, layout);
  // Plotly.update('mapContainer', trace, layout);

  /*important todo: 
    used smaller set of geojson data
    need to scale map along with fire data
    remove legend and axis and other plotly features
    set initial view of map
    remove comments & extra code
  */
}

function zip(...arrays) {
  return arrays[0].map((_, i) => arrays.map(array => array[i]));
}


function formatTime(timeStr) {
  return timeStr.padStart(4, '0').replace(/^(..)(..)$/, '$1:$2');
}

function updateDataCount(count) {
  document.getElementById('totalDataPoints').textContent = count;
}

function getDetail(d) {
  const typeDescription = typeMapping[d.type] || 'Unknown';
  const dayNightDescription = dayNightMapping[d.daynight] || 'Unknown';

  return `
  <b>State:</b> ${d.state_name}<br>
  <b>Latitude:</b> ${d.latitude}<br>
  <b>Longitude:</b> ${d.longitude}<br>
  <b>Date:</b> ${d.acq_date}<br>
  <b>Time:</b> ${formatTime(d.acq_time)}<br>
  <b>DayNight:</b> ${dayNightDescription}<br>
  <b>Type:</b> ${typeDescription}<br>
  <b>Brightness(Temperature):</b> ${d.bright_t31} Kelvin<br>
  <b>Satellite:</b> ${d.satellite}<br>
            `;
}

function getPlotlyLayout(divId) {
  let currentLayout = {};
  const gd = document.getElementById(divId);
  if (gd && gd._fullLayout && gd._fullLayout.mapbox) {
    currentLayout = {
      center: gd._fullLayout.mapbox.center,
      zoom: gd._fullLayout.mapbox.zoom
    };
  }
  return currentLayout;
}
