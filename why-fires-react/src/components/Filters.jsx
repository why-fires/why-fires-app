import { stateOptions, dayNightOptions, typeOptions, monthOptions } from "../constants/options";

const Filters = ({ filters, setFilters }) => (
    <div>
        <select
            value={filters.state}
            onChange={e => setFilters({
                ...filters,
                state: e.target.value
            })}>
            <option value={""}>Select State</option>
            {stateOptions.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>

        <select
            value={filters.dayNight}
            onChange={e => setFilters({
                ...filters,
                dayNight: e.target.value
            })}>
            <option value="">Day/Night</option>
            {Object.entries(dayNightOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </select>

        <select
            value={filters.type}
            onChange={e => setFilters({
                ...filters,
                type: e.target.value
            })}>
            <option value="">Select Type</option>
            {Object.entries(typeOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </select>

        {// TODO: the set date does not seem to filter the data}
        <input
            type="date"
            value={filters.date}
            onChange={e => setFilters({
                ...filters,
                date: e.target.value
            })}
        />

        <select
            value={filters.month}
            onChange={e => setFilters({
                ...filters,
                month: e.target.value
            })}>
            <option value="">Select Month</option>
            {Object.entries(monthOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </select>
    </div>
);

export default Filters;
