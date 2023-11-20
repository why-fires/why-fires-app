import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useRef, useEffect, useState } from 'react';
import Container from 'react-bootstrap/container';
import * as d3 from 'd3';
import Header from './components/Header';
import Filters from './components/Filters';
import Timeline from "./components/Timeline";
import Map2D from "./components/Map2D";
import SidePanel from "./components/SidePanel";

const App = () => {
  const [is3D, setIs3D] = useState(false);
  const [data, setData] = useState([]);

  const [filters, setFilters] = useState({
    state: '',
    dayNight: '',
    type: '',
    date: '',
    month: '',
    year: '2012'
  });

  const filterData = (data) => {
      let filteredData = data;
      filteredData = filters.state ? filteredData.filter(d => d.state_name === filters.state) : filteredData;
      filteredData = filters.dayNight ? filteredData.filter(d => d.daynight === filters.dayNight) : filteredData;
      filteredData = filters.type ? filteredData.filter(d => d.type === filters.type) : filteredData;
      filteredData = filters.date ? filteredData.filter(d => d.acq_date === filters.date) : filteredData;
      if (filters.month) {
          filteredData = filteredData.filter(d => {
              const month = new Date(d.acq_date).getMonth() + 1;
              return month.toString() === filters.month;
          });
      }
      return filteredData;
  };

  useEffect(() => {
      const dataPath = `./data/modis_${filters.year}_United_States.csv`;
      d3.csv(dataPath).then(data => setData(filterData(data)));
  }, [filters]);

  /* TODO: Update month and year when date changes and vice-versa
  useEffect(() => {

  }, [filters.date]);
  useEffect(() => {

  }, [filters.month]);
  useEffect(() => {

  }, [filters.year]);
  */

  return (
      <Container fluid>
        <link href="App.css" rel="stylesheet" />
        <Header />

        <Filters filters={filters} setFilters={setFilters} />
        <Map2D data={data} />
        <Timeline filters={filters} setFilters={setFilters} />

      </Container>
  );
}

export default App;
