import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import './styles.css';

const App = () => {
  const [screenModel, setScreenModel] = useState('');
  const [mountType, setMountType] = useState('');
  const [mediaPlayer, setMediaPlayer] = useState('');
  const [receptacleBox, setReceptacleBox] = useState('');
  const [distanceToFloor, setDistanceToFloor] = useState('');
  const [nicheDepth, setNicheDepth] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [department, setDepartment] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);

  // Fetch and parse CSV data
  useEffect(() => {
    axios.get('http://localhost:5000/uploads/PDF Builder.csv')
      .then((response) => {
        console.log("CSV Response: ", response.data); // Raw CSV Data
        const parsedData = Papa.parse(response.data, { header: true, skipEmptyLines: true });
        console.log("Parsed Data: ", parsedData.data); // Parsed Data
        setData(parsedData.data);
      })
      .catch((err) => {
        alert("Error loading data. Please check the CSV file path and server.");
      });
  }, []);
  
  // Handle PDF download with dynamic data
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Adding project information to PDF
    doc.text('LED Installation Diagram', 20, 20);
    doc.text(`Selected Screen: ${screenModel}`, 20, 30);
    doc.text(`Mount Type: ${mountType}`, 20, 40);
    doc.text(`Media Player: ${mediaPlayer}`, 20, 50);
    doc.text(`Receptacle Box: ${receptacleBox}`, 20, 60);
    doc.text(`Distance from Floor to Screen Center: ${distanceToFloor}`, 20, 70);
    doc.text(`Niche Depth: ${nicheDepth}`, 20, 80);
    doc.text(`Project Title: ${projectTitle}`, 20, 90);
    doc.text(`Designer’s Name: ${designerName}`, 20, 100);
    doc.text(`Department: ${department}`, 20, 110);
    doc.text(`Screen Size: ${screenSize}`, 20, 120);
    doc.text(`Date: ${date}`, 20, 130);

    // Adding dynamic diagram content based on user inputs
    const screenHeight = screenSize * 0.75;
    const screenWidth = screenSize * 1.5;

    // Draw the screen
    doc.setLineWidth(0.5);
    doc.rect(50, 150, screenWidth, screenHeight);

    // Draw the mount
    doc.setLineWidth(0.3);
    doc.rect(50, 150 + screenHeight, 50, 20); // Example, adjust based on mount type

    // Draw receptacle box (dashed box for power receptacle)
    if (doc.setLineDash) {
      doc.setLineDash([4, 2]);
    } else {
      doc.setDash(4, 2);
    }
    doc.rect(120, 150 + screenHeight + 5, 20, 20); // Example position, adjust as needed

    // Save the PDF
    doc.save('Installation_Diagram.pdf');
  };

  // Helper function to get unique options from the data
  const getUniqueOptions = (field) => {
    // Ensure the data is loaded
    if (!data || data.length === 0) {
      console.log("No data available");
      return [];
    }
  
    // Check if field exists in data (first item)
    const fields = Object.keys(data[0]);
    if (!fields.includes(field)) {
      console.log(`Field "${field}" does not exist in the data. Available fields: ${fields}`);
      return [];
    }
  
    // Map unique values for the field
    const uniqueValues = [...new Set(data.map(item => item[field]))];
  
    console.log(`Unique values for ${field}:`, uniqueValues);
  
    return uniqueValues.filter(value => value !== '').map((value, index) => (
      <option key={index} value={value}>{value}</option>
    ));
  };
   

  return (
    <div className="app">
      <h1>LED Drawing Tool</h1>

      {/* Dropdowns for equipment selection */}
      <div className="option-container">
        <label>Screen Model:</label>
        <select value={screenModel} onChange={(e) => setScreenModel(e.target.value)}>
          <option value="">Select Model</option>
          {data.length > 0 ? (
            data.map((item, index) => (
              <option key={index} value={item['Screen MFR']}>
                {item['Screen MFR']}
              </option>
            ))
          ) : (
            <option>No data available</option>
          )}
        </select>
      </div>

      <div className="option-container">
        <label>Mount Type:</label>
        <select value={mountType} onChange={(e) => setMountType(e.target.value)}>
          <option value="">Select Mount Type</option>
          {getUniqueOptions('Mount Type')}
        </select>
      </div>

      <div className="option-container">
        <label>Media Player:</label>
        <select value={mediaPlayer} onChange={(e) => setMediaPlayer(e.target.value)}>
          <option value="">Select Media Player</option>
          {getUniqueOptions('Media Player')}
        </select>
      </div>

      <div className="option-container">
        <label>Receptacle Box:</label>
        <select value={receptacleBox} onChange={(e) => setReceptacleBox(e.target.value)}>
          <option value="">Select Receptacle Box</option>
          {getUniqueOptions('Receptacle Box')}
        </select>
      </div>

      {/* Manual inputs for project information */}
      <div className="option-container">
        <label>Distance from Floor to Screen Center:</label>
        <input type="number" value={distanceToFloor} onChange={(e) => setDistanceToFloor(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Niche Depth:</label>
        <input type="number" value={nicheDepth} onChange={(e) => setNicheDepth(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Project Title:</label>
        <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Designer’s Name:</label>
        <input type="text" value={designerName} onChange={(e) => setDesignerName(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Department:</label>
        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Screen Size:</label>
        <input type="number" value={screenSize} onChange={(e) => setScreenSize(e.target.value)} />
      </div>

      <div className="option-container">
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {/* Button to download the PDF */}
      <button onClick={handleDownloadPDF}>Download PDF</button>
    </div>
  );
};

export default App;
