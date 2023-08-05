
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

const clientId = '98135';
const longNumber = '250fb83eda23244fd4a165a4a8565f398a5e1e56';

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
          client_secret: longNumber,
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

async function getUserData() {
    if (!userData) {
        const apiUrl = 'https://www.strava.com/api/v3/athlete';
        const response = await fetch(apiUrl, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
        });
        userData = await response.json();
        console.log(userData);
        return userData;
    } else {
        console.log("User profile information already present: " + userData)
    }
}

async function getUserStats(id) {
    if (!userStats) {
        const apiUrl = `https://www.strava.com/api/v3/athletes/${id}/stats`;
        const response = await fetch(apiUrl, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
        });
        userStats = await response.json();
        console.log(userStats);
        return userStats;
    } else {
        console.log("User Stats Already Present")
    }
}



function go() {
    const userData = getUserData();
    const id = userData.id;
    const username = userData.username;
    const name = `${userData.firstname} ${userData.lastname}`;
    const creationDate = formatDate(userData.created_at)
    const picture = userData.profile
    
    const userStats = getUserStats(id)
    const maxRide = userStats.biggest_ride_distance
    const rideCount = userStats.all_ride_totals.count
    const rideDistance = userStats.all_ride_totals.distance
    const rideElevation = userStats.all_ride_totals.elevation_gain
    const rideMovingTime = userStats.all_ride_totals.moving_time
    const rideAchievementCount = userStats.all_ride_totals.achievement_count

    const runStats = userStats.all_run_totals
    const runCount = userStats.all_run_totals.count
    const runDistance = userStats.all_run_totals.distance
    const runElevation = userStats.all_run_totals.elevation_gain
    const runMovingTime = userStats.all_run_totals.moving_time
    const runAchievementCount = userStats.all_run_totals.achievement_count
    
    var sportName = ''
    var backgroundColor = ''
    var textColor = ''
    var bigDistanceU = ''
    var smallDistanceU = ''
    console.log('Go for go')
    const colorScheme = document.getElementById("colorScheme").value;
    const units = document.getElementById("units").value;
    const sport = document.getElementById("sport").value;

    // Handle Different Sport Choices
    if (sport == "option1") {
        sportName = "Cyclist Profile"
    } else if (sport == "option2") {
        sportName = "Runner Profile"
    } else {
        sportName = "Strava Profile"
    }

    if (units == "option1") {
        bigDistanceU = " km"
        smallDistanceU = " m"
    } else if (units == "option2") {
        bigDistanceU = " mi"
        smallDistanceU = " ft"
    } else {
        bigDistanceU = " km"
        smallDistanceU = " m"
    }

    // Handle Color Scheme Choices
    if (colorScheme == "option1") {
        var backgroundColor = '#ffffff'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    } else if (colorScheme == "option2") {
        var backgroundColor = '#22272e'
        var textColor = '#adbac7'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else if (colorScheme == "option3") {
        var backgroundColor = '#161b22'
        var textColor = '#c8d6dd'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else {
        var backgroundColor = '#ffffff'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    }
    document.getElementById("output").style.backgroundColor = backgroundColor;
    document.getElementById("output").style.borderColor = textColor;
    const parent = document.getElementById("output");
    const children = parent.querySelectorAll("*");
    for (let i = 0; i < children.length; i++) {
      children[i].style.color = textColor;
    }
    console.log(`Selected Options: ${colorScheme}, ${bigDistanceU}/${smallDistanceU}, ${sportName}`)

    document.getElementById("nameTagline").innerHTML = `${name} ${sportName}`
    document.getElementById("accountInfo").innerHTML = `@${username} | Created ${creationDate}`
    document.getElementById("profilePicture").src = `${picture}`
    if (sport == "option1") {
        document.getElementById("statNumber1").innerHTML = `${rideCount}`
        document.getElementById("statNumber2").innerHTML = `${rideMovingTime}`
        document.getElementById("statNumber3").innerHTML = `${rideElevation}`
        document.getElementById("statNumber4").innerHTML = `${rideDistance}`
        document.getElementById("statNumber6").innerHTML = `${rideAchievementCount}`

        document.getElementById("statNumber5").innerHTML = `${maxRide}`
        document.getElementById("longestRideDistance").classList.remove("hidden");
    } else if (sport == "option2") {
        document.getElementById("statNumber1").innerHTML = `${runCount}`
        document.getElementById("statNumber2").innerHTML = `${runMovingTime}`
        document.getElementById("statNumber3").innerHTML = `${runElevation}`
        document.getElementById("statNumber4").innerHTML = `${runDistance}`
        document.getElementById("statNumber6").innerHTML = `${runAchievementCount}`
    }

}



function formatDate(notFormatted) {
    const date = new Date(notFormatted);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
}
