import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import './styles.css';

const App = () => {
  // State variables
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

  // State to hold parsed data from each API
  const [pdfData, setPdfData] = useState([]);
  const [mountData, setMountData] = useState([]);
  const [mediaPlayerData, setMediaPlayerData] = useState([]);
  const [receptacleBoxData, setReceptacleBoxData] = useState([]);

  // Fetch and parse data from multiple APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pdfResponse, mountResponse, mediaPlayerResponse, receptacleBoxResponse] = await Promise.all([
          axios.get('http://localhost:5000/uploads/PDF Builder.csv', { responseType: 'text' }),
          axios.get('http://localhost:5000/uploads/Mounts.csv', { responseType: 'text' }),
          axios.get('http://localhost:5000/uploads/Mediaplayer.csv', { responseType: 'text' }),
          axios.get('http://localhost:5000/uploads/Rectangularbox.csv', { responseType: 'text' }),
        ]);

        // Parse CSV data using Papa.parse
        setPdfData(Papa.parse(pdfResponse.data, { header: true, skipEmptyLines: true }).data);
        setMountData(Papa.parse(mountResponse.data, { header: true, skipEmptyLines: true }).data);     
        setMediaPlayerData(Papa.parse(mediaPlayerResponse.data, { header: true, skipEmptyLines: true }).data);
        setReceptacleBoxData(Papa.parse(receptacleBoxResponse.data, { header: true, skipEmptyLines: true }).data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading data. Please check the CSV file paths and server.');
      }
    };

    fetchData();
  }, []);

  // Handle PDF download
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

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

    // Save the PDF
    doc.save('Installation_Diagram.pdf');
  };

  const uniqueMediaPlayers = [
    ...new Set(mediaPlayerData.map(item => item['Make'])),
  ];

  return (
    <div className="app">
      <h1>LED Drawing Tool</h1>

      {/* Dropdown for screen model */}
      <div className="option-container">
        <label>Screen Model:</label>
        <select value={screenModel} onChange={(e) => setScreenModel(e.target.value)}>
          <option value="">Select Model</option>
          {pdfData.map((item, index) => (
            <option key={index} value={item['Screen MFR']}>
              {item['Screen MFR']}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown for mount type */}
      <div className="option-container">
        <label>Mount Type:</label>
        <select value={mountType} onChange={(e) => setMountType(e.target.value)}>
          <option value="">Select Mount Type</option>
          {mountData.map((item, index) => (
            <option key={index} value={item['MFG. PART']}>
              {item['MFG. PART']}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown for media player */}
      <div className="option-container">
      <label>Media Player:</label>
      <select value={mediaPlayer} onChange={(e) => setMediaPlayer(e.target.value)}>
        <option value="">Select Media Player</option>
        {uniqueMediaPlayers.map((make, index) => (
          <option key={index} value={make}>
            {make}
          </option>
        ))}
      </select>
    </div>

      {/* Dropdown for receptacle box */}
      <div className="option-container">
        <label>Receptacle Box:</label>
        <select value={receptacleBox} onChange={(e) => setReceptacleBox(e.target.value)}>
          <option value="">Select Receptacle Box</option>
          {receptacleBoxData.map((item, index) => (
            <option key={index} value={item['Brand']}>
              {item['Brand']}
            </option>
          ))}
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

      {/* Button to download PDF */}
      <button onClick={handleDownloadPDF}>Download PDF</button>
    </div>
  );
};

export default App;
