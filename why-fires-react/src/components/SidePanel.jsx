const SidePanel = ({ data, selectedData }) => (
    <div id="detailContainer" style={{marginTop: '100px'}}>
        <div id="dataCount">
            <b>Total Data Points:</b> <span>{data.length}</span>
        </div>
        <div id="detailBox">
            {selectedData
                ? <div dangerouslySetInnerHTML={{__html: selectedData}} />
                : <p>Click on a data point to see the details here.</p>}
        </div>
    </div>
);

export default SidePanel;
