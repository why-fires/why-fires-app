import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Plotly from 'plotly.js-dist-min';

function App() {
  const [is3D, setIs3D] = useState(false);
  const [year, setYear] = useState('2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022');
  const [data, setData] = useState([]);
  const [mapData, setMapData] = useState([]);
  const count = useState(data.length)
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [dataCount, setDataCount] = useState(0);
  const [filters, setFilters] = useState({
    stateFilter: '',
    dayNightFilter: '',
    typeFilter: '',
    dateFilter: '',
    monthFilter: ''
  });

  useEffect(() => {
    loadYearData(year);
  }, [year, filters]);

  useEffect(() => {
    if (mapData.length > 0) {
      createGeoGraph(mapData);
    }
  }, [mapData]);

  const handleToggle3D = () => {
    setIs3D(!is3D);
    loadYearData(year);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  function loadYearData(selectedYear) {
    const dataPath = `./data/modis_${selectedYear}_United_States.csv`;
    d3.csv(dataPath).then(loadedData => {
      const filteredData = filterData(loadedData);
      setData(filteredData);
      setDataCount(filteredData.length); // Update the data count here
      createGeoGraph(filteredData);
    });
  }

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const mapContainer = document.getElementById('mapContainer');
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

  //document.getElementById('yearSlider').addEventListener('input', function(e) {
  //  const year = e.target.value;
  //  document.getElementById('yearDisplay').textContent = year;
  //  loadYearData(year);
  //});

  //loadYearData(document.getElementById('yearSlider').value);

  //document.getElementById('stateFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
  //document.getElementById('dayNightFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
  //document.getElementById('typeFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
  //document.getElementById('dateFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));
  //document.getElementById('monthFilter').addEventListener('change', () => loadYearData(document.getElementById('yearSlider').value));

  function createGeoGraph(data) {
    const currentLayout = getPlotlyLayout('mapContainer');
    const currentCenter = currentLayout.center;
    const currentZoom = currentLayout.zoom;

    if (is3D) {
      create3DMap(data);
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

    Plotly.newPlot('mapContainer', trace, layout).then(() => {
      const mapContainer = document.getElementById('mapContainer');
      mapContainer.on('plotly_click', function(eventData) {
        console.log(eventData); // Log the eventData to inspect its structure
        var detailInfo = eventData.points[0].data.text[eventData.points[0].pointIndex];
        document.getElementById('detailBox').textContent = detailInfo
      });
    });
  }

  function create3DMap(data) {
    //const container = document.getElementById('mapContainer');
    //container.innerHTML = '';

  }

  //function formatTime(timeStr) {
  //  return timeStr.padStart(4, '0').replace(/^(..)(..)$/, '$1:$2');
  //}

  function getDetail(d) {
    const typeDescription = typeMapping[d.type] || 'Unknown';
    const dayNightDescription = dayNightMapping[d.daynight] || 'Unknown';

    return `
  State: ${d.state_name}<br>
  Latitude: ${d.latitude}<br>
  Longitude: ${d.longitude}<br>
  Date: ${d.acq_date}<br>

  DayNight: ${dayNightDescription}<br>
  Type: ${typeDescription}<br>
  Brightness(Temperature): ${d.bright_t31} Kelvin<br>
  Satellite: ${d.satellite}<br>
            `;
  }//  Time: ${formatTime(d.acq_time)}<br>

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

  return (
      <div className="App">
        <div id="filter">
          <select id="stateFilter">
            <option value={""}>Select State</option>
            <option value={"Alabama"}>Alabama</option>
            <option value={"Alaska"}>Alaska</option>
            <option value={"Arizona"}>Arizona</option>
            <option value={"Arkansas"}>Arkansas</option>
            <option value={"California"}>California</option>
            <option value={"Colorado"}>Colorado</option>
            <option value={"Connecticut"}>Connecticut</option>
            <option value={"Delaware"}>Delaware</option>
            <option value={"Florida"}>Florida</option>
            <option value={"Georgia"}>Georgia</option>
            <option value={"Hawaii"}>Hawaii</option>
            <option value={"Idaho"}>Idaho</option>
            <option value={"Illinois"}>Illinois</option>
            <option value={"Indiana"}>Indiana</option>
            <option value={"Iowa"}>Iowa</option>
            <option value={"Kansas"}>Kansas</option>
            <option value={"Kentucky"}>Kentucky</option>
            <option value={"Louisiana"}>Louisiana</option>
            <option value={"Maine"}>Maine</option>
            <option value={"Maryland"}>Maryland</option>
            <option value={"Massachusetts"}>Massachusetts</option>
            <option value={"Michigan"}>Michigan</option>
            <option value={"Minnesota"}>Minnesota</option>
            <option value={"Mississippi"}>Mississippi</option>
            <option value={"Missouri"}>Missouri</option>
            <option value={"Montana"}>Montana</option>
            <option value={"Nebraska"}>Nebraska</option>
            <option value={"Nevada"}>Nevada</option>
            <option value={"New Hampshire"}>New Hampshire</option>
            <option value={"New Jersey"}>New Jersey</option>
            <option value={"New Mexico"}>New Mexico</option>
            <option value={"New York"}>New York</option>
            <option value={"North Carolina"}>North Carolina</option>
            <option value={"North Dakota"}>North Dakota</option>
            <option value={"Ohio"}>Ohio</option>
            <option value={"Oklahoma"}>Oklahoma</option>
            <option value={"Oregon"}>Oregon</option>
            <option value={"Pennsylvania"}>Pennsylvania</option>
            <option value={"Rhode Island"}>Rhode Island</option>
            <option value={"South Carolina"}>South Carolina</option>
            <option value={"South Dakota"}>South Dakota</option>
            <option value={"Tennessee"}>Tennessee</option>
            <option value={"Texas"}>Texas</option>
            <option value={"Utah"}>Utah</option>
            <option value={"Vermont"}>Vermont</option>
            <option value={"Virginia"}>Virginia</option>
            <option value={"Washington"}>Washington</option>
            <option value={"West Virginia"}>West Virginia</option>
            <option value={"Wisconsin"}>Wisconsin</option>
            <option value={"Wyoming"}>Wyoming</option>
          </select>

          <select id="dayNightFilter">
            <option value="">Day/Night</option>
            <option value="D">Day</option>
            <option value="N">Night</option>
          </select>

          <select id="typeFilter">
            <option value="">Select Type</option>
            <option value="0">Presumed Vegetation Fire</option>
            <option value="1">Active Volcano</option>
            <option value="2">Other Static Land Source</option>
            <option value="3">Offshore</option>
          </select>

          <input type="date" id="dateFilter" />
            <select id="monthFilter">
              <option value="">Select Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
        </div>

        <button onClick={handleToggle3D}>Toggle 3D/2D Map</button>

        <div id="mapContainer" style={{width: '80%', height: '500px', float: 'left'}}></div>

        <div style={{ width: '80%', marginTop: '1000px' }}>
          <div id="slider">
            <input type="range" min="2012" max="2022" value={year} onChange={e => setYear(e.target.value)} />
            <h2>{year}</h2>
          </div>
        </div>


        <div id="detailContainer">
          <div id="dataCount">
            <b>Total Data Points:</b> <span>{data.length}</span>
          </div>
          <div id="detailBox">Click on a data point to see the details here.</div>

        </div>
      </div>
  );
}

export default App;
