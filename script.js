const $shipmentDetails = document.querySelector('#shipmentDetails');
const $checkpoints = document.querySelector('#checkpoints');

const $trackingForm = document.querySelector('#tracking');


const $trackingNo = $trackingForm.querySelector('input');

$trackingForm.addEventListener('submit',formSubmitHandler);

let latestCheckpoint = null;

function shipmentDetailsHTML(trackingInfo) {
    return `<div class="shipment-detail">
    <h6>Shipment Details:</h6>
    <p>Agent Reference Number : <span class="cls-agent-ref-no">${trackingInfo.referenceNo}</span></p>
    <p>Origin : <span class="cls-origin">${trackingInfo.origin}</span> </p>
    <p>Destination : <span class="cls-destination">${trackingInfo.destination}</span></p>
    <p>Booking Date : <span class="cls-booking-date">${trackingInfo.bookingDate}</span></p>
    <p>Shipper : <span class="cls-shipper">${trackingInfo.shipper} </span></p>
    <p>Consignee : <span class="cls-consignee">${trackingInfo.consignee} </span></p>
</div>`;
}

function trackHistoryHTML(checkpoints) {
    return `<div class="track-history">
    <h6>Track History:</h6>
    <table id="tblhistroy">
        <tbody>
            <tr>
                <th style="color:#fff;">Date Time</th>
                <th style="color:#fff;">Status</th>
                <th style="color:#fff;">Location</th>
            </tr>
            ${checkpoints.reduce((str, next) => {
                return `${str}<tr$><td>${next.dateTime}</td><td>${next.status}</td><td>${next.recievedBy}</td></tr>`;
            }, '')}
        </tbody>
    </table>
</div>`
}

async function watch() {
    console.log('Watching ', new Date())
    const trackingNo = $trackingNo.value;
    try {
        const result = await track(trackingNo);

        $shipmentDetails.innerHTML = shipmentDetailsHTML(result['TrackDetailReply']['TrackInfo'][0]);
        $checkpoints.innerHTML = trackHistoryHTML(result['TrackDetailReply']['Checkpoints']);
        const isUpdated = setLatestCheckpoint(result['TrackDetailReply']['Checkpoints'][0]);
        
        if(isUpdated) {
            console.log('Done ', new Date())
            playSound('bell.m4a');
        } else {
            setTimeout(watch, 120 * 1000);
        }
    } catch (error) {
        console.log(error);
        watch();
    }

}


function setLatestCheckpoint(checkpoint) {
    let updated = latestCheckpoint !== null && JSON.stringify(latestCheckpoint) !== JSON.stringify(checkpoint);
    latestCheckpoint = checkpoint;

    return updated;
}
function playSound(url) {
    var a = new Audio(url);
    a.play();
}
async function formSubmitHandler(e) {
    e.preventDefault();
    watch();
    return false;
}



async function track(trackingNo) {
    var myHeaders = new Headers();
    myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0");
    myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("Accept-Language", "en-US,en;q=0.5");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Origin", "https://www.tcsexpress.com");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Referer", "https://www.tcsexpress.com/Tracking/");
    myHeaders.append("Cookie", "ASP.NET_SessionId=bkqes1zlizkzeneoi20lmbra");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append("Sec-Fetch-Mode", "cors");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("DNT", "1");
    myHeaders.append("Sec-GPC", "1");
    myHeaders.append("TE", "trailers");
    
    var raw = `TrackingNumber=${trackingNo}`;
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    const response = await fetch("https://cors.bridged.cc/https://www.tcsexpress.com/Tracking/GetData", requestOptions);
    return await response.json();
    //   .then(response => response.text())
    //   .then(result => console.log(result))
    //   .catch(error => console.log('error', error));
}