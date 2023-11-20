const Timeline = ({filters, setFilters}) => (
    <div id="mapContainer" style={{width: '70%', height: '500px', float: 'left'}}>
        <div style={{ width: '80%'}}>
            <div id="slider" style={{justifyContent: 'center', textAlign: 'center', alignItems: 'center', marginLeft: '20%'}}>
                <input type="range" min="2012" max="2022" style={{width: '80%'}}
                       value={filters.year}
                       onChange={e => setFilters({
                           ...filters,
                           year: e.target.value
                       })}/>
                <h2>{filters.year}</h2>
            </div>
        </div>
    </div>
);

export default Timeline;
