import Plot from "react-plotly.js";
import { dayNightOptions, typeOptions } from "../constants/options";
import SidePanel from "./SidePanel";
import { Col, Row } from "react-bootstrap";
import { useState } from "react";

const Map2D = ({ data }) => {
    const [selectedData, setSelectedData] = useState('');
    const [layout, setLayout] = useState({
        mapbox: {
            style: "carto-positron",
            center: { lat: 37.0902, lon: -95.7129 },
            zoom: 3
        },
        height: 1000,
        width: 1000
    });

    const formatTime = (timeStr) =>
        timeStr.padStart(4, "0").replace(/^(..)(..)$/, "$1:$2");

    const getText = (d) => {
        return `<b>State:</b> ${d.state_name}<br>
                <b>Latitude:</b> ${d.latitude}<br>
                <b>Longitude:</b> ${d.longitude}<br>
                <b>Date:</b> ${d.acq_date}<br>
                <b>Time:</b> ${formatTime(d.acq_time)}<br>
                <b>DayNight:</b> ${dayNightOptions[d.daynight] || "Unknown"}<br>
                <b>Type:</b> ${typeOptions[d.type] || "Unknown"}<br>
                <b>Brightness(Temperature):</b> ${d.bright_t31} Kelvin<br>
                <b>Satellite:</b> ${d.satellite}<br>`;
    };

    return (
        <Row>
            <Col>
                <Plot
                    data={[
                        {
                            type: "scattermapbox",
                            mode: "markers",
                            lat: data.map(d => d.latitude),
                            lon: data.map(d => d.longitude),
                            text: data.map(d => getText(d)),
                            marker: {
                                color: "red",
                                size: 10,
                                opacity: 0.8
                            }
                        }]
                    }
                    layout={layout}
                    onUpdate={(figure) => setLayout(figure.layout)}
                    onClick={(figure) => setSelectedData(figure.points[0].text)}
                />
            </Col>
            <Col>
                <SidePanel data={data} selectedData={selectedData} />
            </Col>
        </Row>
    );
};

export default Map2D;
