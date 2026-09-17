
const lastUpdated = document.getElementById("lastUpdated");
const searchBtn = document.getElementById("searchBtn");
const stockInput = document.getElementById("stockInput");

const companyName = document.getElementById("companyName");
const highPrice = document.getElementById("highPrice");
const lowPrice = document.getElementById("lowPrice");
const change = document.getElementById("change");
const priceElement = document.querySelector(".price");

let stockChart;
let autoRefresh;

// Search button
searchBtn.addEventListener("click", fetchStockData);

// Press Enter
stockInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        fetchStockData();
    }
});

// Clickable Watchlist
document.querySelectorAll(".watch-items span").forEach(item => {
    item.addEventListener("click", () => {
        stockInput.value = item.dataset.symbol;
        fetchStockData();
    });
});

// Main function
async function fetchStockData(){

    const symbol = stockInput.value.trim().toUpperCase();

    if(symbol === ""){
        alert("Please enter a stock symbol.");
        return;
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try{

        const response = await fetch(url);
        const data = await response.json();

        if(data.c === 0){
            alert("Stock not found.");
            return;
        }

        updateUI(symbol, data);
        drawChart(symbol, data);

        // Restart auto refresh
        clearInterval(autoRefresh);

        autoRefresh = setInterval(() => {
            fetchLatestPrice(symbol);
        }, 30000);

    }

    catch(error){
        console.error(error);
        alert("Error fetching stock data.");
    }

}

// Auto-refresh function
async function fetchLatestPrice(symbol){

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try{

        const response = await fetch(url);
        const data = await response.json();

        updateUI(symbol, data);
        drawChart(symbol, data);

        console.log(`Updated ${symbol} at ${new Date().toLocaleTimeString()}`);

    }

    catch(error){
        console.error(error);
    }

}

// Update UI
function updateUI(symbol, data){

    const companyNames = {
        "AAPL":"Apple Inc.",
        "TSLA":"Tesla Inc.",
        "GOOGL":"Alphabet Inc.",
        "INFY.NS":"Infosys",
        "TCS.NS":"Tata Consultancy Services"
    };

    companyName.textContent = companyNames[symbol] || symbol;

    priceElement.textContent = `$${data.c.toFixed(2)}`;
    highPrice.textContent = `$${data.h.toFixed(2)}`;
    lowPrice.textContent = `$${data.l.toFixed(2)}`;

    const percent = (data.dp || 0).toFixed(2);

    change.textContent = `${percent}%`;

    change.style.color = percent >= 0 ? "#22c55e" : "#ef4444";
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

// Draw Chart
function drawChart(symbol, data){

    const ctx = document.getElementById("stockChart").getContext("2d");

    if(stockChart){
        stockChart.destroy();
    }

    stockChart = new Chart(ctx,{

        type:"line",

        data:{
            labels:[
                "Previous Close",
                "Today's Low",
                "Current Price",
                "Today's High"
            ],

            datasets:[{
                label:`${symbol} Price`,
                data:[
                    data.pc,
                    data.l,
                    data.c,
                    data.h
                ],

                borderColor:"#2d73ff",
                backgroundColor:"rgba(45,115,255,0.25)",
                fill:true,
                tension:0.4,
                pointBackgroundColor:"#ffffff",
                pointRadius:5
            }]
        },

        options:{

            responsive:true,
            maintainAspectRatio:false,

            plugins:{
                legend:{
                    labels:{
                        color:"white"
                    }
                }
            },

            scales:{

                x:{
                    ticks:{color:"white"},
                    grid:{color:"#44566f"}
                },

                y:{
                    ticks:{color:"white"},
                    grid:{color:"#44566f"}
                }

            }

        }

    });

}