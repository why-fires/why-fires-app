// import Globe from 'globe.gl';
// import * as THREE from 'https://threejs.org/build/three.module.js';

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
  const container = document.getElementById('map3D');
  container.style.display = 'block';

  // Modify current data
  const brightnessArr = data.map(obj => obj.brightness);
  console.log("b Arr" + brightnessArr);
  normalize(brightnessArr);
  // const minB = 1;
  // const maxB = 2;
  const modifiedData = data.map(obj => ({
    lat: obj.latitude,
    lng: obj.longitude,
    brightness: obj.brightness //(obj.brightness - minB) / (maxB - minB)
  }));
  console.log(modifiedData[0]);

  // Gen random data
  // const N = 100;
  // const gData = [...Array(N).keys()].map(() => ({
  //   lat: (Math.random() - 0.5) * 180,
  //   lng: (Math.random() - 0.5) * 360,
  //   brightness: Math.random() / 3,
  //   color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
  // }));

  // console.log(gData);


  const world = Globe();
  world(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    // .hexBinPointWeight('pop')
    // .hexAltitude(d => d.sumWeight * 6e-8)
    // .hexBinResolution(4)
    // .hexTopColor(d => weightColor(d.sumWeight))
    // .hexSideColor(d => weightColor(d.sumWeight))
    // .hexBinMerge(true)
    // .enablePointerInteraction(false) // performance improvement
    .pointsData(modifiedData.slice(0, 100))
    .pointAltitude('brightness');
    // .pointColor('red');
    // .pointsData(data);

  // Promise.all(data)
  //   .then(d => d3.csvParse(d, ({ lat, lng, pop }) => ({ lat: +lat, lng: +lng, pop: +pop })))
  //   .then(data => world.hexBinPointsData(data));

}

function normalize(x) {
  let xminimum = x.reduce((min, current) => (current < min) ? current : min)
  let xmaximum = x.reduce((max, current) => (current > max) ? current : max)
  let xnormalized = x.map((item) => (item - xminimum) / (xmaximum - xminimum))

  // console.log("norm'd" + xnormalized);
  return xnormalized;
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
