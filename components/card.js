var data;
var userData;
var userStats;

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

const clientId = '111687';
const longNumber = '7e417fc36b963fbce56903215cce12a0b5fdba70';

// Redirect the user to the Strava authorization page
function authenticate() {
    console.log('Starting Auth Sequence')
    const redirectUri = 'https://stravacard.pages.dev';
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
    console.log('getUserData() function called')
    if (!userData) {
        console.log('Trying to get user data from Strava API')
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
    console.log('getUserStats(id) function called')
    if (!userStats) {
        console.log('Trying to get user stats from Strava API')
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



async function go() {
    const userData = await getUserData();
    console.log(`User Data: ${userData}`)

    const id = String(userData.id);
    console.log(`User ID: ${id}`)
    const username = userData.username;
    const name = `${userData.firstname} ${userData.lastname}`;
    const creationDate = formatDate(userData.created_at)
    const picture = userData.profile
    
    const userStats = await getUserStats(id)
    console.log(`User Stats: ${userStats}`)
    const rideCount = userStats.all_ride_totals.count.toLocaleString(undefined, { useGrouping: true });
    const rideMovingTime = toTime(userStats.all_ride_totals.moving_time)

    var maxRide = userStats.biggest_ride_distance/1000;
    var rideDistance = userStats.all_ride_totals.distance/1000;
    var rideElevation = userStats.all_ride_totals.elevation_gain;

    const runMovingTime = toTime(userStats.all_run_totals.moving_time);
    const runCount = userStats.all_run_totals.count.toLocaleString(undefined, { useGrouping: true });

    var runDistance = userStats.all_run_totals.distance/1000;
    var runElevation = userStats.all_run_totals.elevation_gain;
    
    var sportName = ''
    var backgroundColor = ''
    var textColor = ''
    var bigDistanceU = ''
    var smallDistanceU = ''
    console.log('Go for go')
    const colorScheme = document.getElementById("colorScheme").value;
    const units = document.getElementById("units").value;
    const sport = document.getElementById("sport").value;
    const flag = document.getElementById("flag").value;
    const flagFormatted = await formatFlag(flag);
    // Handle Different Sport Choices
    if (sport == "option1") {
        sportName = "Cycling Profile"
    } else if (sport == "option2") {
        sportName = "Running Profile"
    } else {
        sportName = "Strava Profile"
    }

    if (units == "option1") {
        maxRide = `${Math.floor(maxRide).toLocaleString(undefined, { useGrouping: true })} km`
        rideDistance = `${Math.floor(rideDistance).toLocaleString(undefined, { useGrouping: true })} km`
        rideElevation = `${Math.floor(rideElevation).toLocaleString(undefined, { useGrouping: true })} m`
        runDistance = `${Math.floor(runDistance).toLocaleString(undefined, { useGrouping: true })} km`
        runElevation = `${Math.floor(runElevation).toLocaleString(undefined, { useGrouping: true })} m`
    } else if (units == "option2") {
        maxRide = `${Math.floor(maxRide * 0.6213711922).toLocaleString(undefined, { useGrouping: true })} ft`
        rideDistance = `${Math.floor(rideDistance * 0.6213711922).toLocaleString(undefined, { useGrouping: true })} mi`
        rideElevation = `${Math.floor(rideElevation * 3.280839895).toLocaleString(undefined, { useGrouping: true })} ft`
        runDistance = `${Math.floor(runDistance * 0.6213711922).toLocaleString(undefined, { useGrouping: true })} mi`
        runElevation = `${Math.floor(runElevation * 3.280839895).toLocaleString(undefined, { useGrouping: true })} ft`
    } else {
        maxRide = `${Math.floor(maxRide).toLocaleString(undefined, { useGrouping: true })} km`
        rideDistance = `${Math.floor(rideDistance).toLocaleString(undefined, { useGrouping: true })} km`
        rideElevation = `${Math.floor(rideElevation).toLocaleString(undefined, { useGrouping: true })} m`
        runDistance = `${Math.floor(runDistance).toLocaleString(undefined, { useGrouping: true })} km`
        runElevation = `${Math.floor(runElevation).toLocaleString(undefined, { useGrouping: true })} m`
    }

    // Handle Color Scheme Choices
    if (colorScheme == "option1") {
        var backgroundColor = '#ffffff'
        var outlineColor = '#F2F2F2'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    } else if (colorScheme == "option2") {
        var backgroundColor = '#22272e'
        var outlineColor = '#333A45'
        var textColor = '#adbac7'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else if (colorScheme == "option3") {
        var backgroundColor = '#161b22'
        var outlineColor = '#212933'
        var textColor = '#c8d6dd'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else {
        var backgroundColor = '#ffffff'
        var outlineColor = '#F2F2F2'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    }
    document.getElementById("output").style.backgroundColor = backgroundColor;
    document.getElementById("output").style.borderColor = outlineColor;
    const parent = document.getElementById("output");
    const children = parent.querySelectorAll("*");
    for (let i = 0; i < children.length; i++) {
      children[i].style.color = textColor;
    }
    console.log(`Selected Options: ${colorScheme}, ${bigDistanceU}/${smallDistanceU}, ${sportName}`)

    document.getElementById("nameTagline").innerHTML = `${name} ${sportName}`
    document.getElementById("accountInfo").innerHTML = `@${username} | Created ${creationDate}`
    document.getElementById("profilePicture").src = picture
    if (flagFormatted == '' || flagFormatted == 'undefined' || flagFormatted == 'null' || flagFormatted == 'none') {
        document.getElementById('profileFlag').style.visibility = 'hidden';
    }
    document.getElementById("profileFlag").src = `https://cdn.countryflags.com/thumbs/${flagFormatted}/flag-button-round-500.png`

    if (sport == "option1") {
        document.getElementById("statLabel1").innerHTML = 'Total Ride Count'
        document.getElementById("statLabel2").innerHTML = 'Total Ride Moving Time'
        document.getElementById("statLabel3").innerHTML = 'Total Ride Elevation Gain'
        document.getElementById("statLabel4").innerHTML = 'Total Ride Distance'

        document.getElementById("statNumber1").innerHTML = `${rideCount}`
        document.getElementById("statNumber2").innerHTML = `${rideMovingTime}`
        document.getElementById("statNumber3").innerHTML = `${rideElevation}`
        document.getElementById("statNumber4").innerHTML = `${rideDistance}`

        document.getElementById("statNumber5").innerHTML = `${maxRide}`
        document.getElementById("longestRideDistance").classList.remove("hidden");
    } else if (sport == "option2") {
        document.getElementById("statLabel1").innerHTML = 'Total Run Count'
        document.getElementById("statLabel2").innerHTML = 'Total Run Moving Time'
        document.getElementById("statLabel3").innerHTML = 'Total Run Elevation Gain'

        document.getElementById("statLabel4").innerHTML = 'Total Run Distance'

        document.getElementById("statNumber1").innerHTML = `${runCount}`
        document.getElementById("statNumber2").innerHTML = `${runMovingTime}`
        document.getElementById("statNumber3").innerHTML = `${runElevation}`
        document.getElementById("statNumber4").innerHTML = `${runDistance}`
    }
    document.getElementById("output").visibility = 'visible'
    html2canvas(document.querySelector("#output"), {backgroundColor:null, allowTaint:true, 'window.devicePixelRatio':5}).then(canvas => {
        document.getElementById("card").appendChild(canvas)
    });
    document.getElementById("output").visibility = 'hidden'
    document.getElementById("output").display = 'none'

}

function formatDate(notFormatted) {
    const date = new Date(notFormatted);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
}

function formatFlag(flagIn) {
    const flagLowercase = flagIn.toLowerCase();
    const flagNoSpaces = flagLowercase.replace(/\s/g, "-");
    const flagNoSpacesOrDots = flagNoSpaces.replace(/[\s.]/g, "");
    if (flagNoSpacesOrDots == 'united-states-of-america' || flagNoSpacesOrDots == 'united-states' || flagNoSpacesOrDots == 'usa' || flagNoSpacesOrDots == 'us' || flagNoSpacesOrDots == 'america' ) {
        return 'united-states-of-america';
    }
    if  (flagNoSpacesOrDots == 'hong-kong') {
        return 'hongkong';
    }
    if (flagNoSpacesOrDots == 'the-netherlands') {
        return 'netherlands';
    }
    return flagNoSpacesOrDots;
}
function toTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const hoursString = hours > 0 ? `${hours} h ` : '';
    const minutesString = minutes > 0 ? `${minutes} min` : '';
    return `${hoursString}${minutesString}`;
  }

async function flagChanged() {
    console.log('Flag Changed')
    const flag = document.getElementById("flag").value;
    const flagFormatted = await formatFlag(flag);
    console.log(`Flag deemed to be '${flagFormatted}' after formatting.`)
    if (flagFormatted == '' || flagFormatted == 'undefined' || flagFormatted == 'null' || flagFormatted == 'none') {
        document.getElementById('profileFlag').style.visibility = 'hidden';
    }
    document.getElementById("profileFlag").src = `https://cdn.countryflags.com/thumbs/${flagFormatted}/flag-button-round-500.png`
};

function colorChanged() {
    console.log('Color Scheme Changed')
    console.log('Running Color Scheme Function')
    if (colorScheme == "option1") {
        var backgroundColor = '#ffffff'
        var outlineColor = '#F2F2F2'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    } else if (colorScheme == "option2") {
        var backgroundColor = '#22272e'
        var outlineColor = '#333A45'
        var textColor = '#adbac7'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else if (colorScheme == "option3") {
        var backgroundColor = '#161b22'
        var outlineColor = '#212933'
        var textColor = '#c8d6dd'
        document.getElementById("stravaWatermark").style.opacity = 0.03;
    } else {
        var backgroundColor = '#ffffff'
        var outlineColor = '#F2F2F2'
        var textColor = '#1f2328'
        document.getElementById("stravaWatermark").style.opacity = 0.1;
    }
    document.getElementById("output").style.backgroundColor = backgroundColor;
    document.getElementById("output").style.borderColor = outlineColor;
    for (let i = 0; i < children.length; i++) {
      children[i].style.color = textColor;
    }
};