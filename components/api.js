const clientId = '98135';
const clientSecret = '250fb83eda23244fd4a165a4a8565f398a5e1e56';
var code;
var activities = [];
var userData
var data
var accessToken
var startDate = 0;
var endDate = (Date.now() / 1000 );
var displayAmount
var opacity = 0.9;
var mapColor = "#3289c7"
var activityPurpose = "All Activities";
var activityType = "All Activities";
var mapStyle = "Single Color"; 
var wantedStartDate = 0;
var wantedEndDate = 99999999999999;

window.addEventListener("load", (event) => {
    getURLCode()
    if (code) {
        console.log('Code Found on Load') 
        getAccessToken(code)
    } else {
        console.log('Code Not Present on Load') 
    }
});

async function main() {
    await getActivities()
}

// Redirect the user to the Strava authorization page
function authenticate() {
  console.log('Starting Auth Sequence')
  const redirectUri = 'https://ridemap.tk/card';
  const responseType = 'code';
  const scope = 'read,activity:read';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  window.location.href = authUrl;
}


// Get the authorization code from the URL
function getURLCode() {
    const urlParams = new URLSearchParams(window.location.search);
    code = urlParams.get('code');
    if (code) {
        console.log(code)
        return code
    }
}

// Exchange the authorization code for an access token
async function getAccessToken(code) {
  const tokenUrl = 'https://www.strava.com/oauth/token';
  if (!data || !data.access_token) {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code', 
      }),
    });
    data = await response.json(); 
    console.log("Access Token = " + data.access_token)
  } else {
    console.log("Access Token Already Ready") 
  }
  accessToken = data.access_token;
  return accessToken;
}

async function getActivities() {
    const displayCount = parseInt(document.getElementById("displayCount").value);
    const pageCount = Math.ceil(displayCount / 100);
    for (let i = 0; i < pageCount ; i++) {
        const page = i + 1
        console.log(`Getting Page ${page}`)
        const activitiesLink = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&per_page=100&page=${page}`;
        const response = await fetch(activitiesLink);
        const activityData = await response.json();
        activities = activities.concat(activityData);
    }
    console.log(activities);
}



function displayRides() {
    for (let i = 0; i < activities.length; i++) {
        const coordinates = L.Polyline.fromEncoded(activities[i].map.summary_polyline).getLatLngs();
        const distance = (Math.round(activities[i].distance / 100) / 10);
        const typeName = activities[i].sport_type.replace(/([a-z])([A-Z])/g, '$1 $2');
        const epochDate = Date.parse(activities[i].start_date_local) / 1000
        const formattedDate = formatDate(activities[i].start_date_local);
        
        const elapsedTime = formatTime(activities[i].elapsed_time);
        const movingTime = formatTime(activities[i].moving_time);
        const activityName = activities[i].name;
        
        if (document.getElementById('mapStyle').value == "Recency") {
            if ( i < 75 ) {
                opacity = 1 - (i * 0.01)
            } else {
                opacity = 0.25
            }
        };
        
        if (document.getElementById('mapStyle').value == "Random Color") {
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            mapColor = "#" + randomColor;
        };
        
        if (matchActivityPurpose(i) == true && matchActivityType(i) == true && matchPrivStatus(i) == true && matchDateStatus(i) == true) {
                console.log(activityName)
                L.polyline(
                    coordinates,
                    {
                        color: mapColor,
                        weight: 4,
                        opacity: opacity,
                        lineJoin:'round'
                    }
                ).bindPopup(`
                    <p class="activityTitle">${activityName}</p>
                    <p class="date">${formattedDate}</p>
                    <p>Moving Time: ${movingTime}</p>
                    <p>Distance: ${distance}km</p>

                    <a href=\"https://www.strava.com/activities/${activities[i].id}\" targe t="_blank">View on Strava</a>
                `).on('click', function(e) {
                    var layer = e.target;
                    layer.setstyle({
                        color: '#e2eb02',
                        opacity: opacity,
                        weight: 4
                    });
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }                    
                    map.fitBounds(layer.getBounds());
                    layer.setStyle({
                        color: '#e2eb02',
                        opacity: 1,
                        weight: 8
                    });
                }).on('mouseover', function(e) { 
                    var layer = e.target;
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }  
                    layer.setStyle({
                        color: '#e2eb02',
                        opacity: opacity,
                        weight: 8
                    });
                }).on('mouseout', function(e) {
                    var layer = e.target;
                    if (document.getElementById('mapStyle').value == "Random Color") {
                        var randomColor = Math.floor(Math.random()*16777215).toString(16);
                        mapColor = "#" + randomColor;
                    };
                    layer.setStyle({
                        color: mapColor,
                        opacity: opacity,
                        weight: 4
                    });
                }).addTo(traces)
                document.getElementById("activityListContainer").innerHTML = document.getElementById("activityListContainer").innerHTML + `<a class="activityListItem" href="https://www.strava.com/activities/${activities[i].id}" targe t="_blank"">${i + 1}. ${activityName}</a><br>`
    }
    };
    if (mapStyle == "Heatmap") {
        var heatmap = L.webGLHeatmap({size: 100, opacity: 0.5}); 
        heatmap.setData(traces)
        map.addLayer(heatmap);
        console.log("Created Heatmap")
        map.fitBounds(traces.getBounds());
    } else {
        traces.addTo(map)
        map.fitBounds(traces.getBounds());
    }
}            

function formatDate(notFormatted) {
    const date = new Date(notFormatted);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
}
function formatTime(seconds) {
    const time = new Date(seconds);
    time.setSeconds(time);
    return time.toISOString().substr(11, 8)
}

function removeParamFromURL() {
  const urlObj = new URL(location); 
  urlObj.searchParams.delete('state');
  urlObj.searchParams.delete('code');
  urlObj.searchParams.delete('scope');
  window.location.href = urlObj.toString();
  return urlObj.toString();
}

function updateStartDate() {
    wantedStartDate = new Date(document.getElementById('startDate').value).getTime();
    console.log(`Updated Start Date to ${wantedStartDate}`)
}

function updateEndDate() {
    wantedEndDate = new Date(document.getElementById('endDate').value).getTime();
    console.log(`Updated Start Date to ${wantedEndDate}`)
}

function updateMapType() {
    mapStyle = document.getElementById('mapStyle').value;
    if (mapStyle == "Random Color") {
        document.getElementById('picker').style.display = "none";
        document.getElementById('traceColor').style.display = "none";
    } else {
        document.getElementById('picker').style.display = "table";
        document.getElementById('traceColor').style.display = "table";
    }
    console.log(`Updated Map Type to ${mapStyle}`)
}

function matchDateStatus(activityNumber) {
    const activityDate = Date.parse(activities[activityNumber].start_date_local);
    console.log(`Activity Timestamp ${activityDate}`)
    if (activityDate > wantedStartDate  && activityDate < wantedEndDate) {
        console.log("Date Check Successful")
        return true;
    } else {
        console.log("Date Check Failed")
        return false;
    }
}

function matchPrivStatus(activityNumber) {
    const activityPrivateFilter = document.getElementById('privateActivities').checked;
    const realActivitySetting = activities[activityNumber].private;
    
    if ( activityPrivateFilter == true) {
        console.log("Private Check Successful")
        return true;
    } else if ( realActivitySetting == false ) {
        console.log("Private Check Successful")
        return true;
    } else {
        console.log("Private Check Failed")
        return false;
    }
}

function matchActivityType(activityNumber) {
    const activityTypeFilter = document.getElementById('activityType').value;
    const realActivityType = activities[activityNumber].type;

    if (activityTypeFilter == "All Activities") {
        console.log("Activity Type Check Successful")
        return true;
    } else if (activityTypeFilter == "Runs/Hikes/Walks") {
        if (realActivityType == "Run" || realActivityType == "Walk" || realActivityType == "Hike" ) {
            console.log("Activity Type Check Successful")
            return true;
        } else {
            console.log("Activity Type Check Failed")
            return false;
        }
    } else if (activityTypeFilter == "Rides") {
        if (realActivityType == "Ride" || realActivityType == "EBikeRide" || realActivityType == "Handcycle" || realActivityType == "Velomobile" ) {
            console.log("Activity Type Check Successful")
            return true;
        } else {
            console.log("Activity Type Check Failed")
            return false;
        }
    } else if (activityTypeFilter == "Skiing/Skating" ) {
        if ( realActivityType == "AlpineSki" || realActivityType == "BackcountrySki" || realActivityType == "NordicSki" || realActivityType == "RollerSki" || realActivityType == "Snowboard" || realActivityType == "IceSkate" || realActivityType == "InlineSkate" || realActivityType == "Skateboard" || realActivityType == "Wheelchair" ) {
            console.log("Activity Type Check Successful")
            return true;
        } else {
            console.log("Activity Type Check Failed")
            return false;
        }
    } else if (activityTypeFilter == "Water Sports" ) {
        if (realActivityType == "Canoeing" || realActivityType == "Kayaking" || realActivityType == "Kitesurf" || realActivityType == "Rowing" || realActivityType == "Sail" || realActivityType == "StandUpPaddling" || realActivityType == "Surfing" || realActivityType == "Swim" || realActivityType == "Windsurf" ) {
            console.log("Activity Type Check Successful")
            return true;
        } else {
            console.log("Activity Type Check Failed")
            return false;
        }
    } else {
        console.log("Couldn't determine wanted activity type filter.")
        return true;
    }
}
function matchActivityPurpose(activityNumber) {
    const activityPurposeFilter = document.getElementById('activityPurpose').value;
    const isCommute = activities[activityNumber].commute;

    if (activityPurposeFilter == "All Activities") {
        console.log("Commute Check Successful")
        return true;
    } else if (activityPurposeFilter == "No Commutes") {
        if (isCommute == true) {
            console.log("Commute Check Failed")
            return false;
        } else {
            console.log("Commute Check Successful")
            return true;
        }
    } else if (activityPurposeFilter == "Only Commutes") {
        if (isCommute == true) {
            console.log("Commute Check Successful")
            return true;
        } else {
            console.log("Commute Check Failed")
            return false;
        } 
    } else {
        console.log("Couldn't determine wanted activity purpose filter.")
        return true;
    }
}

function exportGPX() {
    const output = L.ConvertCoords.GPX.convert(traces);
    const fileName = "Strava Traces.gpx";
    saveAs(new Blob([output], {type: "text/xml;charset=utf-8;"}), fileName);
    console.log("Exported GPX")
}

function showViewCount() {
    document.getElementById("hitCount").style.display = "inline"
    document.getElementById("hitCount").style.visibility = "visible"
}