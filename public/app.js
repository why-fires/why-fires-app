import * as THREE from 'https://threejs.org/build/three.module.js';

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
  let currentLayout = getPlotlyLayout('map2D');
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
    createGeoGraph(filteredData, currentZoom, currentCenter);
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
    create3DMap(data);
  } else {
    create2DMap(data, currentZoom, currentCenter);
  }
}

function create2DMap(data, currentZoom, currentCenter) {
  document.getElementById('toggle3D').innerHTML = "Toggle 3D View";
  document.getElementById('map3D').style.display = 'none';
  document.getElementById('map2D').style.display = 'block';

  let trace = [
    {
      type: 'scattermapbox',
      mode: 'markers',
      lat: data.map(d => d.latitude),
      lon: data.map(d => d.longitude),
      text: data.map(d => getDetail(d)),
      marker: {
        color: 'red',
        size: 10,
        opacity: 0.8
      }
    }
  ];

  let layout = {
    mapbox: {
      style: 'carto-positron',
      center: currentCenter || { lat: 37.0902, lon: -95.7129 },
      zoom: currentZoom || 3
    },
    height: 1000,
  };

  Plotly.newPlot('map2D', trace, layout);

  map2D.on('plotly_click', function(data){
    var infotext = data.points[0].data.text[data.points[0].pointIndex];

    var detailsBox = document.getElementById('detailBox');
    detailsBox.style.display = 'block';
    detailsBox.innerHTML = infotext;
  });
}

function create3DMap(data) {
  document.getElementById('toggle3D').innerHTML = "Toggle 2D View";
  document.getElementById('map2D').style.display = 'none';
  document.getElementById('map3D').style.display = 'block';

  // 1st try - nothing
  // Sample GeoJSON data
  // const geojsonData = {
  //   "type": "FeatureCollection",
  //   "features": [
  //       {
  //           "type": "Feature",
  //           "geometry": {
  //               "type": "Point",
  //               "coordinates": [-73.9857, 40.7484]
  //           },
  //           "properties": {
  //               "temperature": 25
  //           }
  //       },
  //       // Add more test data points
  //   ]
  // };

  // // Set up scene, camera, and renderer
  // const scene = new THREE.Scene();
  // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // const renderer = new THREE.WebGLRenderer();
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(renderer.domElement);

  // // Create 3D points based on GeoJSON data
  // geojsonData.features.forEach(feature => {
  //   const [longitude, latitude] = feature.geometry.coordinates;
  //   const temperature = feature.properties.temperature;

  //   const geometry = new THREE.BoxGeometry(1, 1, temperature);
  //   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //   const cube = new THREE.Mesh(geometry, material);
  //   cube.position.set(longitude, latitude, temperature / 2);
  //   scene.add(cube);
  // });

  // // Set up camera position
  // camera.position.z = 5;

  // // Animation function
  // const animate = () => {
  //     requestAnimationFrame(animate);
  //     renderer.render(scene, camera);
  // };

  // animate();

  //2nd try - loads 3js cube
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // console.log(data);
  // console.log(data[0]);

  d3.json('./data/US_State_Boundaries.geojson')
    .then((geojsonData) => {
      let projection = d3.geoIdentity().fitSize([window.innerWidth, window.innerHeight], geojsonData);

      geojsonData.features.forEach((feature) => {
        // projection = d3.geoIdentity().fitSize([window.innerWidth, window.innerHeight], geojsonData);

        const [x, y] = projection(feature.geometry.coordinates[0][0]);
        // console.log(feature.geometry.coordinates);
        console.log(x);
        console.log(y);
        const geometry = new THREE.BoxGeometry(1, 3, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, 1);
        scene.add(cube);
      });
    })
    .catch((error) => console.error('Error loading GeoJSON data:', error));

  // const geometry = new THREE.BoxGeometry( 2, 1, 1 );
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // scene.add( cube );

  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();

  //3rd try - nothing, process US geojson and fire data
  // Set up scene, camera, and renderer
  // const scene = new THREE.Scene();
  // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // const renderer = new THREE.WebGLRenderer();
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(renderer.domElement);

  // // Load US GeoJSON data
  // const geojsonPath = './data/US_State_Boundaries.geojson';
  // const csvPath = './data/modis_2012_United_States.csv';

  // Promise.all([
  //     d3.json(geojsonPath),
  //     data
  // ]).then(([geojsonData, populationData]) => {
  //     // Projection setup
  //     const projection = d3.geoIdentity().fitSize([window.innerWidth, window.innerHeight], geojsonData);

  //     // Create a dictionary to store population data by state name
  //     const populationByState = {};
  //     populationData.forEach((d) => {
  //         populationByState[d.state_name] = +d.brightness; // Convert brightness to a number
  //     });

  //     // Create 3D shapes based on GeoJSON data
  //     geojsonData.features.forEach((feature) => {
  //         const [x, y] = projection(feature.geometry.coordinates);
  //         const stateName = feature.properties.NAME;
  //         const population = populationByState[stateName] || 0;

  //         const geometry = new THREE.BoxGeometry(1, 1, population / 100000);
  //         const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  //         const cube = new THREE.Mesh(geometry, material);
  //         cube.position.set(x, y, population / 200000);
  //         scene.add(cube);
  //     });
  // }).catch((error) => console.error('Error loading data:', error));


  // // Set up camera position
  // camera.position.z = 5;

  // // Animation function
  // const animate = () => {
  // requestAnimationFrame(animate);
  // renderer.render(scene, camera);
  // };

  // animate();
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
