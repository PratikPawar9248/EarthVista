/* eslint-disable no-restricted-globals */
// Web Worker for processing large datasets without blocking the UI

self.onmessage = async function(e) {
  const { type, data, options } = e.data;

  try {
    switch (type) {
      case 'PARSE_CSV':
        await parseCSV(data, options);
        break;
      case 'PARSE_JSON':
        await parseJSON(data, options);
        break;
      case 'DECIMATE_DATA':
        await decimateData(data, options);
        break;
      default:
        throw new Error(`Unknown worker task: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    });
  }
};

// Parse CSV data
async function parseCSV(csvText, options) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Auto-detect column indices
  const latIndex = headers.findIndex(h => 
    /^(lat|latitude)$/i.test(h)
  );
  const lonIndex = headers.findIndex(h => 
    /^(lon|longitude|long)$/i.test(h)
  );
  
  // Find value column (first numeric column that's not lat/lon)
  let valueIndex = -1;
  let valueField = '';
  
  for (let i = 0; i < headers.length; i++) {
    if (i !== latIndex && i !== lonIndex) {
      const testValue = lines[1]?.split(',')[i];
      if (testValue && !isNaN(parseFloat(testValue))) {
        valueIndex = i;
        valueField = headers[i];
        break;
      }
    }
  }

  if (latIndex === -1 || lonIndex === -1 || valueIndex === -1) {
    throw new Error('Could not detect latitude, longitude, or value columns');
  }

  self.postMessage({
    type: 'PROGRESS',
    progress: 0,
    message: 'Parsing CSV data...'
  });

  const dataPoints = [];
  const totalLines = lines.length - 1;
  const batchSize = 10000;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const lat = parseFloat(values[latIndex]);
    const lon = parseFloat(values[lonIndex]);
    const value = parseFloat(values[valueIndex]);

    if (!isNaN(lat) && !isNaN(lon) && !isNaN(value)) {
      dataPoints.push({ lat, lon, value });
    }

    // Send progress updates
    if (i % batchSize === 0) {
      self.postMessage({
        type: 'PROGRESS',
        progress: (i / totalLines) * 100,
        message: `Parsed ${i.toLocaleString()} of ${totalLines.toLocaleString()} rows...`
      });
    }
  }

  // Decimate if dataset is too large
  const decimatedData = decimateIfNeeded(dataPoints, options?.maxPoints || 50000);

  self.postMessage({
    type: 'COMPLETE',
    data: decimatedData,
    metadata: {
      originalCount: dataPoints.length,
      decimatedCount: decimatedData.length,
      valueField,
      fields: headers
    }
  });
}

// Parse JSON data
async function parseJSON(jsonText, options) {
  self.postMessage({
    type: 'PROGRESS',
    progress: 0,
    message: 'Parsing JSON data...'
  });

  const jsonData = JSON.parse(jsonText);
  const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

  if (dataArray.length === 0) {
    throw new Error('Empty JSON data');
  }

  // Auto-detect field names
  const sample = dataArray[0];
  const latField = Object.keys(sample).find(k => /^(lat|latitude)$/i.test(k));
  const lonField = Object.keys(sample).find(k => /^(lon|longitude|long)$/i.test(k));
  
  let valueField = '';
  for (const key of Object.keys(sample)) {
    if (key !== latField && key !== lonField && typeof sample[key] === 'number') {
      valueField = key;
      break;
    }
  }

  if (!latField || !lonField || !valueField) {
    throw new Error('Could not detect latitude, longitude, or value fields');
  }

  const dataPoints = [];
  const batchSize = 10000;

  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    const lat = parseFloat(item[latField]);
    const lon = parseFloat(item[lonField]);
    const value = parseFloat(item[valueField]);

    if (!isNaN(lat) && !isNaN(lon) && !isNaN(value)) {
      dataPoints.push({ lat, lon, value });
    }

    if (i % batchSize === 0) {
      self.postMessage({
        type: 'PROGRESS',
        progress: (i / dataArray.length) * 100,
        message: `Parsed ${i.toLocaleString()} of ${dataArray.length.toLocaleString()} records...`
      });
    }
  }

  const decimatedData = decimateIfNeeded(dataPoints, options?.maxPoints || 50000);

  self.postMessage({
    type: 'COMPLETE',
    data: decimatedData,
    metadata: {
      originalCount: dataPoints.length,
      decimatedCount: decimatedData.length,
      valueField,
      fields: Object.keys(sample)
    }
  });
}

// Decimate data if it exceeds max points
function decimateIfNeeded(dataPoints, maxPoints) {
  if (dataPoints.length <= maxPoints) {
    return dataPoints;
  }

  // Use systematic sampling for large datasets
  const step = Math.ceil(dataPoints.length / maxPoints);
  const decimated = [];

  for (let i = 0; i < dataPoints.length; i += step) {
    decimated.push(dataPoints[i]);
  }

  return decimated;
}

// Decimate existing data
async function decimateData(dataPoints, options) {
  const maxPoints = options?.maxPoints || 50000;
  
  self.postMessage({
    type: 'PROGRESS',
    progress: 50,
    message: 'Decimating data...'
  });

  const decimated = decimateIfNeeded(dataPoints, maxPoints);

  self.postMessage({
    type: 'COMPLETE',
    data: decimated,
    metadata: {
      originalCount: dataPoints.length,
      decimatedCount: decimated.length
    }
  });
}
