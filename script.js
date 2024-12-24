const apiUrl = "https://api.thingspeak.com/channels/1596152/feeds.json?results=10";

async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Complete Data from API:", data);
        displayChannelInfo(data.channel);
        displayFieldsData(data.channel, data.feeds);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("channel-info").innerHTML = "<p>Error loading channel information.</p>";
        document.getElementById("fields-data").innerHTML = "<p>Error loading fields data.</p>";
    }
}

function displayChannelInfo(channel) {
    const channelInfo = `
        <p><strong>Name:</strong> ${channel.name}</p>
        <p><strong>Description:</strong> ${channel.description}</p>
        <p><strong>Latitude:</strong> ${channel.latitude}</p>
        <p><strong>Longitude:</strong> ${channel.longitude}</p>
        <p><strong>Last Updated:</strong> ${new Date(channel.updated_at).toLocaleString()}</p>
    `;
    document.getElementById("channel-info").innerHTML = channelInfo;
}

function displayFieldsData(channel, feeds) {
    const fieldsDataDiv = document.getElementById("fields-data");
    fieldsDataDiv.innerHTML = "";
    const fieldNames = {
        "field1": "PM2.5",
        "field2": "PM10",
        "field3": "Humidity",
        "field4": "Ozone",
        "field5": "Temperature",
        "field6": "CO"
    };

    Object.keys(channel).forEach(key => {
        if (key.startsWith("field")) {
            const fieldName = fieldNames[key] || "Unknown Field";
            const fieldDiv = document.createElement("div");
            fieldDiv.className = "field";

            const fieldValues = feeds.map(feed => parseFloat(feed[key]) || 0);
            const fieldLabels = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString());

            fieldDiv.innerHTML = `
                <h3>${fieldName}</h3>
                <div class="chart-container">
                    <canvas id="chart-${key}"></canvas>
                </div>
            `;
            fieldsDataDiv.appendChild(fieldDiv);

            renderChart(`chart-${key}`, fieldLabels, fieldValues, fieldName);
        }
    });
}

function renderChart(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    const chartConfig = {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                borderColor: "rgba(0, 123, 255, 1)",
                borderWidth: 1,
                fill: false
            }]
        },
        options: getChartOptions()
    };

    new Chart(ctx, chartConfig);
}

function getChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                    color: "#ffffff",
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    color: "#b0b0b0"
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Value",
                    color: "#ffffff",
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                ticks: {
                    color: "#b0b0b0"
                },
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: "#e0e0e0"
                }
            }
        }
    };
}
fetchData();
setInterval(fetchData, 3600000); // Refresh every 1 hour
