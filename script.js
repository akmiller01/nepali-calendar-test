// Sample data for the chart (in Nepali calendar)
const dataNepali = [
    { year: 2076, value: 50 },
    { year: 2077, value: 80 },
    { year: 2078, value: 120 },
    { year: 2079, value: 90 },
];

// Function to create the bar chart
function createBarChart(data) {
    // Clear the existing chart if it exists
    d3.select("#chart").html("");

    // Set the dimensions and margins for the chart
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element and append it to the chart container
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the scales for x and y axes
    const xScale = d3
        .scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    // Create and append the x and y axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Create and append the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value))
        .attr("fill", "steelblue");

    // Add labels for the x and y axes
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .text("Year");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .text("Value");
}

// Function to fetch days inbetween two dates
function getDates(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  }

// Function to convert Nepali year data to Gregorian year data
function convertToGregorian(dataNepali) {
    const dailyGregorianData = [];

    dataNepali.forEach((row) => {
        startDateNepali = new NepaliDate(row.year, 0, 1);
        // Chaitra can have 30 or 31 days.
        // Setting it to 31 on a year with 30 rolls over to 1 Boishakh.
        endDateNepali = new NepaliDate(row.year, 11, 31);
        if(endDateNepali.getDate() === 1){
            endDateNepali = new NepaliDate(row.year, 11, 30);
        }
        startDateGreg = startDateNepali.toJsDate();
        endDateGreg = endDateNepali.toJsDate();
        dateRangeGreg = getDates(startDateGreg, endDateGreg);
        dateRangeGreg.forEach((intermediateDay) => {
            dailyGregorianData.push({
                year: intermediateDay.getFullYear(),
                value: row.value
            })
        })
    });

    // Create an object to store the sum and count of values for each year
    const yearData = {};

    // Iterate through the array and group objects by year
    dailyGregorianData.forEach((item) => {
        const { year, value } = item;
        if (!yearData[year]) {
        yearData[year] = { sum: 0, count: 0 };
        }
        yearData[year].sum += value;
        yearData[year].count += 1;
    });

    // Calculate the average for each year
    const averages = Object.keys(yearData).map((year) => ({
        year: parseInt(year),
        value: yearData[year].sum / yearData[year].count,
    }));

    return averages;
}

// Function to update the chart based on the selected calendar
function updateChart(isGregorian) {
    const chartData = isGregorian ? dataGregorian : dataNepali;
    createBarChart(chartData);
}

// Toggle switch event handler
document.getElementById('calendar-toggle').addEventListener('change', function () {
    const calendarLabel = document.getElementById('calendar-label');
    const isChecked = this.checked;

    if (isChecked) {
        // Switch to Nepali calendar
        calendarLabel.innerText = 'Gregorian';
        // Convert data to Nepali calendar years
        dataGregorian = convertToGregorian(dataNepali);
        // Update the chart with Nepali calendar data
        updateChart(true);
    } else {
        // Switch to Gregorian calendar
        calendarLabel.innerText = 'Nepali';
        // Update the chart with Gregorian calendar data
        updateChart(false);
    }
});

// Initialize the chart with default Gregorian data
createBarChart(dataNepali);