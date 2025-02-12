let fetchedData = null;
let agencyName = null;

window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('libs/bootstrap.bundle.min.js');
  script.onload = () => {
    const btn = document.createElement('button');
    btn.innerHTML = 'Export';
    btn.className = 'my-2 py-2 px-4 btn btn-secondary dropdown-toggle';
    btn.type = 'button';
    btn.setAttribute('data-bs-toggle', 'dropdown');
    btn.setAttribute('aria-expanded', 'false');

    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu';
    
    const csvItem = document.createElement('li');
    const csvLink = document.createElement('a');
    csvLink.className = 'dropdown-item';
    csvLink.href = '#';
    csvLink.innerText = 'CSV';
    csvLink.addEventListener('click', downloadCSV);
    csvItem.appendChild(csvLink);

    // const kmlItem = document.createElement('li');
    // kmlItem.className = 'disabled';
    // const kmlLink = document.createElement('a');
    // kmlLink.className = 'dropdown-item';
    // kmlLink.href = '#';
    // kmlLink.setAttribute('aria-disabled', 'true');
    // kmlLink.innerText = 'KML';
    // kmlLink.addEventListener('click', () => { console.debug('not implemented') });
    // kmlItem.appendChild(kmlLink);

    dropdownMenu.appendChild(csvItem);
    // dropdownMenu.appendChild(kmlItem);

    const column = document.createElement('div');
    column.className = 'col-lg-3 col-sm-12 dropdown';
    column.appendChild(btn);
    column.appendChild(dropdownMenu);

    const observer = new MutationObserver((mutations, obs) => {
      const container = document.querySelector('div.deployment-section-header-row');
      if (container) {
        container.classList.remove('justify-content-end');
        container.appendChild(column);
        obs.disconnect(); // Stop observing once the element is found and modified
      }
    });

    // Start observing the document for changes
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  };

  script.onerror = (e) => {
    console.error('Failed to load Bootstrap JS', e);
  };
  document.head.appendChild(script);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'dataFetched') {
    fetchedData = message.data;
    agencyName = message.agencyName;
  }
});

const isArrayOrObject = (value) => Array.isArray(value) || (typeof value === "object" && value !== null );

function arrayToCSV(data, agencyName) {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data array. Cannot convert to CSV');
    return;
  }

  const NOT_SET = '< not set >';
  const headersToKeys = {
    "Name": "name",
    "Latitude": "lat",
    "Longitude": "lng",
    "Address": "address",
    "Product": "type",
    "Pole": "poleType",
    "Power": cam => cam.products.find(p => p.family === 'Cameras')?.powerType ?? NOT_SET,
    "Bucket Truck": "bucketTruck",
    "Security Escort": "securityEscort",
    "Traffic Control": "maintenanceTrafficControl",
    "Flock Sign": "flockSignRequired",
    "Permit Required": cam => cam.permitType !== 'None', // uncertain
    "Permit Jurisdiction": NOT_SET, // uncertain
    "Traffic Level": "trafficLevel",
    "Number of Lanes": "numLanes",
    "Speed Limit (mph)": "speedLimit",
    "Distance from Road (ft)": "distanceFromRoadwayFt",
    "Focal Length": cam => cam.products.find(p => p.family === 'Cameras')?.focalLength ?? NOT_SET,
    "Carriers": cam => cam.carriersSupported.join(', '),
    "Utility Agreement": NOT_SET,
    "3rd Party Involvement": NOT_SET,
    "Deployment Name": agencyName
  }

  return [
    Object.keys(headersToKeys).join(','),
    ...data
      .filter(cam => cam.status !== 'Decommissioned')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(row => Object.values(headersToKeys).map(key => {
        if (typeof key === 'function') 
          return escapeCommas(key(row));
        else
          return escapeCommas(row[key]) ?? NOT_SET;
      }).join(',')),
    ].join('\n');
}

function downloadCSV() {
  if (!fetchedData) {
    console.warn('No data fetched yet');
    return;
  }

  const csv = arrayToCSV(fetchedData, agencyName);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFileSafeName(agencyName);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

function makeFileSafeName(location) {
  return location
    .trim()
    .replace(/\s*\/\s*/g, '_') // Remove slashes and spaces around them
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-zA-Z0-9,]/g, '') // Remove all special characters except commas
    + `_cameras_${Date.now()}.csv`; // Append timestamp
}

function escapeCommas(str) {
  if (typeof str !== 'string') return str;
  if (str.includes(',')) {
    return `"${str}"`;
  }
  return str;
}
