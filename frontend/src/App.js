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
  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();

  //   doc.text('LED Installation Diagram', 20, 20);
  //   doc.text(`Selected Screen: ${screenModel}`, 20, 30);
  //   doc.text(`Mount Type: ${mountType}`, 20, 40);
  //   doc.text(`Media Player: ${mediaPlayer}`, 20, 50);
  //   doc.text(`Receptacle Box: ${receptacleBox}`, 20, 60);
  //   doc.text(`Distance from Floor to Screen Center: ${distanceToFloor}`, 20, 70);
  //   doc.text(`Niche Depth: ${nicheDepth}`, 20, 80);
  //   doc.text(`Project Title: ${projectTitle}`, 20, 90);
  //   doc.text(`Designer’s Name: ${designerName}`, 20, 100);
  //   doc.text(`Department: ${department}`, 20, 110);
  //   doc.text(`Screen Size: ${screenSize}`, 20, 120);
  //   doc.text(`Date: ${date}`, 20, 130);

  //   // Save the PDF
  //   doc.save('Installation_Diagram.pdf');
  // };
  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  
  //   // Title of the document
  //   doc.text('LED Installation Diagram', 20, 20);
  
  //   // Add user input data to the PDF
  //   doc.text(`Project Title: ${projectTitle}`, 20, 30);
  //   doc.text(`Designer’s Name: ${designerName}`, 20, 40);
  //   doc.text(`Department: ${department}`, 20, 50);
  //   doc.text(`Screen Size: ${screenSize}`, 20, 60);
  //   doc.text(`Screen Model: ${screenModel}`, 20, 70);
  //   doc.text(`Mount Type: ${mountType}`, 20, 80);
  //   doc.text(`Media Player: ${mediaPlayer}`, 20, 90);
  //   doc.text(`Receptacle Box: ${receptacleBox}`, 20, 100);
  //   doc.text(`Distance from Floor to Screen Center: ${distanceToFloor} cm`, 20, 110);
  //   doc.text(`Niche Depth: ${nicheDepth} cm`, 20, 120);
  //   doc.text(`Date: ${date}`, 20, 130);
  
  //   // Diagram section (screen, mount, media player, etc.)
  //   const xStart = 20;
  //   const yStart = 140;
  
  //   // Draw the LED screen (represented as a rectangle for simplicity)
  //   const screenWidth = screenSize * 2; // Adjust dynamically based on screen size
  //   const screenHeight = 120; // Fixed height for the screen
  //   doc.rect(xStart, yStart, screenWidth, screenHeight); // Draw the screen rectangle
  //   doc.text('LED Screen', xStart + screenWidth / 2 - 20, yStart + screenHeight / 2); // Label the screen
  
  //   // Draw the media player (represented as a smaller rectangle)
  //   const mediaPlayerWidth = 40; // Sample width for the media player
  //   const mediaPlayerHeight = 40; // Sample height for the media player
  //   doc.rect(xStart + screenWidth - mediaPlayerWidth - 10, yStart + screenHeight + 10, mediaPlayerWidth, mediaPlayerHeight); // Draw media player
  //   doc.text('Media Player', xStart + screenWidth - mediaPlayerWidth / 2 - 10, yStart + screenHeight + 25); // Label media player
  
  //   // Draw the receptacle box (represented as a dashed rectangle)
  //   const receptacleBoxWidth = 30; // Sample width for the receptacle box
  //   const receptacleBoxHeight = 30; // Sample height for the receptacle box
  //   doc.setLineWidth(1);
  //   doc.setLineDash([5, 5]); // Dashed lines for receptacle box
  //   doc.rect(xStart + screenWidth / 2 - receptacleBoxWidth / 2, yStart + screenHeight + 60, receptacleBoxWidth, receptacleBoxHeight); // Draw receptacle box
  //   doc.text('Receptacle Box', xStart + screenWidth / 2 - receptacleBoxWidth / 2, yStart + screenHeight + 75); // Label receptacle box
  //   doc.setLineDash([]); // Reset dashed line style
  
  //   // Add distance label (for distance from floor to screen center)
  //   doc.text(`Distance from Floor to Screen Center: ${distanceToFloor} cm`, xStart, yStart + screenHeight + 90);
  
  //   // Optional: Add additional elements such as niche depth or toggle between horizontal/vertical orientation
  
  //   // Save the generated PDF
  //   doc.save('Installation_Diagram.pdf');
  // };
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
  
    // Title of the document
    doc.text('LED Installation Diagram', 20, 20);
  
    // Add user input data
    doc.text(`Project Title: ${projectTitle}`, 20, 30);
    doc.text(`Designer’s Name: ${designerName}`, 20, 40);
    doc.text(`Department: ${department}`, 20, 50);
    doc.text(`Screen Size: ${screenSize}`, 20, 60);
    doc.text(`Screen Model: ${screenModel}`, 20, 70);
    doc.text(`Mount Type: ${mountType}`, 20, 80);
    doc.text(`Media Player: ${mediaPlayer}`, 20, 90);
    doc.text(`Receptacle Box: ${receptacleBox}`, 20, 100);
    doc.text(`Distance from Floor to Screen Center: ${distanceToFloor} cm`, 20, 110);
    doc.text(`Niche Depth: ${nicheDepth} cm`, 20, 120);
    doc.text(`Date: ${date}`, 20, 130);
  
    // Diagram section
    const xStart = 20;
    const yStart = 140;
  
    // Draw the LED screen
    const screenWidth = screenSize ? parseInt(screenSize) * 2 : 100; // Dynamic width
    const screenHeight = 120; // Fixed height
    doc.rect(xStart, yStart, screenWidth, screenHeight);
    doc.text('LED Screen', xStart + screenWidth / 2 - 20, yStart + screenHeight / 2);
  
    // Draw the media player
    const mediaPlayerWidth = mediaPlayer ? 40 : 30; // Dynamic width if mediaPlayer is selected
    const mediaPlayerHeight = mediaPlayer ? 40 : 30; // Dynamic height
    doc.rect(xStart + screenWidth - mediaPlayerWidth - 10, yStart + screenHeight + 10, mediaPlayerWidth, mediaPlayerHeight);
    doc.text(mediaPlayer || 'Media Player', xStart + screenWidth - mediaPlayerWidth / 2 - 10, yStart + screenHeight + 25);
  
    // Draw the receptacle box
    const receptacleBoxWidth = receptacleBox ? 30 : 20; // Dynamic width
    const receptacleBoxHeight = receptacleBox ? 30 : 20; // Dynamic height
    doc.setLineDash([5, 5]);
    doc.rect(xStart + screenWidth / 2 - receptacleBoxWidth / 2, yStart + screenHeight + 60, receptacleBoxWidth, receptacleBoxHeight);
    doc.text(receptacleBox || 'Receptacle Box', xStart + screenWidth / 2 - receptacleBoxWidth / 2, yStart + screenHeight + 75);
    doc.setLineDash([]);
  
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
