import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Papa from "papaparse";
import "./styles.css";
import "./App.css";
import logoimg from "./assets/logo_web-1.png";

const App = () => {
  // State variables
  const [screenModel, setScreenModel] = useState("");
  const [mountType, setMountType] = useState("");
  const [mediaPlayer, setMediaPlayer] = useState("");
  const [receptacleBox, setReceptacleBox] = useState("");
  const [distanceToFloor, setDistanceToFloor] = useState("");
  const [nicheDepth, setNicheDepth] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [designerName, setDesignerName] = useState("");
  const [department, setDepartment] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [date, setDate] = useState("");

  // State to hold parsed data from each API
  const [pdfData, setPdfData] = useState([]);
  const [mountData, setMountData] = useState([]);
  const [mediaPlayerData, setMediaPlayerData] = useState([]);
  const [receptacleBoxData, setReceptacleBoxData] = useState([]);
  const [orientation, setOrientation] = useState("Vertical"); // Default to Vertical
  const [wallType, setWallType] = useState("Niche"); // Default to Niche

  // Fetch and parse data from multiple APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          pdfResponse,
          mountResponse,
          mediaPlayerResponse,
          receptacleBoxResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/uploads/PDF Builder.csv", {
            responseType: "text",
          }),
          axios.get("http://localhost:5000/uploads/Mounts.csv", {
            responseType: "text",
          }),
          axios.get("http://localhost:5000/uploads/Mediaplayer.csv", {
            responseType: "text",
          }),
          axios.get("http://localhost:5000/uploads/Rectangularbox.csv", {
            responseType: "text",
          }),
        ]);

        // Parse CSV data using Papa.parse
        setPdfData(
          Papa.parse(pdfResponse.data, { header: true, skipEmptyLines: true })
            .data
        );
        setMountData(
          Papa.parse(mountResponse.data, { header: true, skipEmptyLines: true })
            .data
        );
        setMediaPlayerData(
          Papa.parse(mediaPlayerResponse.data, {
            header: true,
            skipEmptyLines: true,
          }).data
        );
        setReceptacleBoxData(
          Papa.parse(receptacleBoxResponse.data, {
            header: true,
            skipEmptyLines: true,
          }).data
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(
          "Error loading data. Please check the CSV file paths and server."
        );
      }
    };

    fetchData();
  }, []);

  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();

  //   // Title of the document
  //   doc.text("LED Installation Diagram", 20, 20);

  //   // Add user input data
  //   doc.text(`Project Title: ${projectTitle}`, 20, 30);
  //   doc.text(`Designer’s Name: ${designerName}`, 20, 40);
  //   doc.text(`Department: ${department}`, 20, 50);
  //   doc.text(`Screen Size: ${screenSize}`, 20, 60);
  //   doc.text(`Screen Model: ${screenModel}`, 20, 70);
  //   doc.text(`Mount Type: ${mountType}`, 20, 80);
  //   doc.text(`Media Player: ${mediaPlayer}`, 20, 90);
  //   doc.text(`Receptacle Box: ${receptacleBox}`, 20, 100);
  //   doc.text(
  //     `Distance from Floor to Screen Center: ${distanceToFloor} cm`,
  //     20,
  //     110
  //   );
  //   doc.text(`Niche Depth: ${nicheDepth} cm`, 20, 120);
  //   doc.text(`Date: ${date}`, 20, 130);

  //   // Diagram section
  //   const xStart = 20;
  //   const yStart = 140;

  //   // Draw the LED screen
  //   const screenWidth = screenSize ? parseInt(screenSize) * 2 : 100; // Dynamic width
  //   const screenHeight = 120; // Fixed height
  //   doc.rect(xStart, yStart, screenWidth, screenHeight);
  //   doc.text(
  //     "LED Screen",
  //     xStart + screenWidth / 2 - 20,
  //     yStart + screenHeight / 2
  //   );

  //   // Draw the media player
  //   const mediaPlayerWidth = mediaPlayer ? 40 : 30; // Dynamic width if mediaPlayer is selected
  //   const mediaPlayerHeight = mediaPlayer ? 40 : 30; // Dynamic height
  //   doc.rect(
  //     xStart + screenWidth - mediaPlayerWidth - 10,
  //     yStart + screenHeight + 10,
  //     mediaPlayerWidth,
  //     mediaPlayerHeight
  //   );
  //   doc.text(
  //     mediaPlayer || "Media Player",
  //     xStart + screenWidth - mediaPlayerWidth / 2 - 10,
  //     yStart + screenHeight + 25
  //   );

  //   // Draw the receptacle box
  //   const receptacleBoxWidth = receptacleBox ? 30 : 20; // Dynamic width
  //   const receptacleBoxHeight = receptacleBox ? 30 : 20; // Dynamic height
  //   doc.setLineDash([5, 5]);
  //   doc.rect(
  //     xStart + screenWidth / 2 - receptacleBoxWidth / 2,
  //     yStart + screenHeight + 60,
  //     receptacleBoxWidth,
  //     receptacleBoxHeight
  //   );
  //   doc.text(
  //     receptacleBox || "Receptacle Box",
  //     xStart + screenWidth / 2 - receptacleBoxWidth / 2,
  //     yStart + screenHeight + 75
  //   );
  //   doc.setLineDash([]);

  //   // Save the PDF
  //   doc.save("Installation_Diagram.pdf");
  // };

const handleDownloadPDF = async () => {
  const pdf = new jsPDF();

  // Collect all input values
  const data = {
    screenModel,
    mountType,
    mediaPlayer,
    receptacleBox,
    distanceToFloor,
    nicheDepth,
    projectTitle,
    designerName,
    department,
    screenSize,
    date,
    orientation,
    wallType,
  };

  // Draw diagram on canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const screenWidth = parseInt(screenSize) || 55; // Assume default 55 if not set
  const gap = screenWidth <= 55 ? 1.5 : 2;

  canvas.width = 400;
  canvas.height = 300;

  // Outer box (niche)
  context.strokeStyle = "#000";
  context.lineWidth = 2;
  context.strokeRect(50, 50, 300, 200);

  // Inner box (screen)
  const innerBoxWidth = 300 - gap * 2 * 10;
  const innerBoxHeight = 200 - gap * 2 * 10;
  context.strokeRect(50 + gap * 10, 50 + gap * 10, innerBoxWidth, innerBoxHeight);

  // Dashed power outlet location
  context.setLineDash([5, 5]);
  context.strokeRect(200, 200, 50, 30);

  // Add labels for measurements
  context.setLineDash([]);
  context.font = "12px Arial";
  context.fillText("Outer Width: 300px", 50, 45);
  context.fillText(`Gap: ${gap}in`, 50, 270);
  context.fillText("Inner Width: " + innerBoxWidth + "px", 50 + gap * 10, 45 + gap * 10);
  context.fillText("Distance to Floor: " + distanceToFloor, 50, 290);

  // Convert canvas to image and add to PDF
  const canvasImage = canvas.toDataURL("image/png");
  pdf.addImage(canvasImage, "PNG", 10, 10, 180, 120);

  // Add input values to PDF
  pdf.setFontSize(12);
  let yOffset = 140;
  for (const [key, value] of Object.entries(data)) {
    pdf.text(`${key}: ${value || "N/A"}`, 10, yOffset);
    yOffset += 10;
  }

  // Download the PDF
  pdf.save("configuration.pdf");
};



  const uniqueMediaPlayers = [
    ...new Set(mediaPlayerData.map((item) => item["MFGPART"])),
  ];

 
  

  return (
    <div className="container">
      <div className="large-box" style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 2, border: "1px solid black", padding: "10px" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 400"
        style={{ width: "100%", height: "auto" }}
      >
        {/* Outer solid rectangle */}
        <rect
          x="50"
          y="50"
          width="500"
          height="300"
          stroke="black"
          fill="none"
          strokeWidth="2"
        />

        {/* Inner dashed rectangle (niche box) */}
        <rect
          x="75"
          y="75"
          width="450"
          height="250"
          stroke="black"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Small dashed rectangle for "recessed receptacle box" */}
        <rect
          x="275"
          y="175"
          width="50"
          height="50"
          stroke="black"
          fill="none"
          strokeDasharray="2 2"
        />

        {/* Lines and Labels */}
        {/* Vertical center line */}
        <line
          x1="300"
          y1="50"
          x2="300"
          y2="350"
          stroke="black"
          strokeDasharray="2 2"
        />

        {/* Horizontal center line */}
        <line
          x1="50"
          y1="200"
          x2="550"
          y2="200"
          stroke="black"
          strokeDasharray="2 2"
        />

        {/* Horizontal dimension - Top */}
        <line x1="50" y1="40" x2="550" y2="40" stroke="black" />
        <text x="295" y="30" fontSize="12" fill="black">
          48.5"
        </text>

        {/* Vertical dimension - Left */}
        <line x1="40" y1="50" x2="40" y2="350" stroke="black" />
        <text
          x="30"
          y="200"
          fontSize="12"
          fill="black"
          transform="rotate(-90, 30, 200)"
        >
          30.5"
        </text>

        {/* Horizontal dimension - Bottom */}
        <line x1="50" y1="360" x2="550" y2="360" stroke="black" />
        <text x="295" y="375" fontSize="12" fill="black">
          51"
        </text>

        {/* Vertical dimension - Right */}
        <line x1="560" y1="50" x2="560" y2="350" stroke="black" />
        <text
          x="570"
          y="200"
          fontSize="12"
          fill="black"
          transform="rotate(-90, 570, 200)"
        >
          50"
        </text>

        {/* Arrow line 1 - Intended Screen Position */}
        <line
          x1="300"
          y1="200"
          x2="450"
          y2="100"
          stroke="black"
          strokeWidth="1"
          markerEnd="url(#arrow)"
        />
        <text x="460" y="95" fontSize="12" fill="black">
          Intended Screen Position
        </text>

        {/* Arrow line 2 - Install Recessed Box */}
        <line
          x1="300"
          y1="200"
          x2="200"
          y2="300"
          stroke="black"
          strokeWidth="1"
          markerEnd="url(#arrow)"
        />
        <text x="110" y="310" fontSize="12" fill="black">
          Install recessed receptacle box
        </text>

        {/* Arrowhead marker definition */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="black" />
          </marker>
        </defs>
      </svg>
    </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", margin: "5px" }}>
            <div
              style={{ flex: 1, border: "1px solid black", padding: "10px" }}
            >
              <h4>Niche Dimensions:</h4>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Height
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    30.5"
                  </div>
                </li>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Width
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    51"
                  </div>
                </li>
                <li style={{ display: "flex", border: "1px solid black" }}>
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Depth
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    3.7"
                  </div>
                </li>
              </ul>
            </div>

            <div
              style={{ flex: 1, border: "1px solid black", padding: "10px" }}
            >
              <h4>Screen Dimensions:</h4>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Height
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    28"
                  </div>
                </li>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Width
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    48.5"
                  </div>
                </li>
                <li style={{ display: "flex", border: "1px solid black" }}>
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Floor Line
                  </div>
                  <div
                    style={{
                      flex: 1,
                      // backgroundColor: "#ddd",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    50"
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{ flex: 1, border: "1px solid black", padding: "10px" }}
            >
              <h4>Notes</h4>
              <p>Install recessed receptacle box with:</p>
              <p>2x Terminated Power Outlets</p>
              <p>1x Terminated Data CAT5 Ethernet Outlet</p>
              {/* <ul>
                <li>2x Terminated Power Outlets</li>
                <li>1x Terminated Data CAT5 Ethernet Outlet</li>
              </ul> */}
            </div>

            <div
              style={{ flex: 1, border: "1px solid black", padding: "10px" }}
            >
              <ul style={{ listStyleType: "none", padding: 0 }}>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Height
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    6.6"
                  </div>
                </li>
                <li
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Width
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    6.012"
                  </div>
                </li>
                <li
                  style={{
                    display: "flex",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#ccc",
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    Depth
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "5px",
                      textAlign: "center",
                    }}
                  >
                    3.75"
                  </div>
                </li>
              </ul>
            </div>
          </div>

  <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#333",
        border: "1px solid #d1c3a4",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* Top Section: Logo, Address, Description */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 2fr",
          alignItems: "center",
          padding: "10px",
          gap: "10px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <img
            src={logoimg}
            alt="SignCast Logo"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </div>

        {/* Address */}
        <div style={{ textAlign: "center", lineHeight: "1.5" }}>
          <strong>361 Steelcase RD. W, #1,</strong>
          <br />
          MARKHAM, ONTARIO
          <br />
          Phone: (416) 900-2233
        </div>

        {/* Description */}
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
          Description:
          <br />
          Horizontal + PC In Niche
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          textAlign: "center",
          border: "1px solid #ccc",
        }}
      >
        {/* First Row: Headers */}
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Drawn
        </div>
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Dimensions In Inches
        </div>
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Screen Size
        </div>
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Date
        </div>

        {/* Second Row: Content */}
        <div style={{ padding: "10px", border: "1px solid #ccc" }}>SignCast</div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <img
            src="https://via.placeholder.com/50"
            alt="Dimension Icon"
            style={{ width: "50px", height: "auto" }}
          />
        </div>
        <div style={{ padding: "10px", border: "1px solid #ccc" }}>LG 55” Touch Display</div>
        <div style={{ padding: "10px", border: "1px solid #ccc" }}>09/12/2023</div>

        {/* Third Row */}
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Sheet
        </div>
        <div style={{ padding: "10px", border: "1px solid #ccc" }}>1 of 1</div>
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Revision
        </div>
        <div style={{ padding: "10px", border: "1px solid #ccc" }}>00</div>

        {/* Fourth Row */}
        <div style={{ backgroundColor: "#f6d89b", fontWeight: "bold", padding: "10px", border: "1px solid #ccc" }}>
          Department
        </div>
        <div
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            gridColumn: "2 / 5",
            textAlign: "left",
          }}
        >
          Installations
        </div>
      </div>
    </div>


        </div>
      </div>

      <div className="small-box">
        <h1>Configuration</h1>
        <div className="option-container">
          <label>Screen</label>
          <select
            value={screenModel}
            onChange={(e) => setScreenModel(e.target.value)}
          >
            <option value=""></option>
            {pdfData.map((item, index) => (
              <option key={index} value={item["Screen MFR"]}>
                {item["Screen MFR"]}
              </option>
            ))}
          </select>
        </div>

        <div className="option-container">
          <label>Media Player</label>
          <select
            value={mediaPlayer}
            onChange={(e) => setMediaPlayer(e.target.value)}
          >
            <option value=""></option>
            {uniqueMediaPlayers.map((MFGPART, index) => (
              <option key={index} value={MFGPART}>
                {MFGPART}
              </option>
            ))}
          </select>
        </div>
        <div className="option-container">
          <label>Mount</label>
          <select
            value={mountType}
            onChange={(e) => setMountType(e.target.value)}
          >
            <option value=""></option>
            {mountData.map((item, index) => (
              <option key={index} value={item["MFG. PART"]}>
                {item["MFG. PART"]}
              </option>
            ))}
          </select>
        </div>

        <div className="option-container">
          <label>Receptacle Box</label>
          <select
            value={receptacleBox}
            onChange={(e) => setReceptacleBox(e.target.value)}
          >
            <option value="">Select Receptacle Box</option>
            {receptacleBoxData.map((item, index) => (
              <option key={index} value={item["Brand"]}>
                {item["Brand"]}
              </option>
            ))}
          </select>
        </div>
        <div className="option-toggle">
          <button
            className={orientation === "Vertical" ? "active" : ""}
            onClick={() => setOrientation("Vertical")}
          >
            Vertical
          </button>
          <button
            className={orientation === "Horizontal" ? "active" : ""}
            onClick={() => setOrientation("Horizontal")}
          >
            Horizontal
          </button>
        </div>

        <div className="option-toggle">
          <button
            className={wallType === "Niche" ? "active" : ""}
            onClick={() => setWallType("Niche")}
          >
            Niche
          </button>
          <button
            className={wallType === "Flat Wall" ? "active" : ""}
            onClick={() => setWallType("Flat Wall")}
          >
            Flat Wall
          </button>
        </div>

        <div className="static-values">
          <div className="value-box">
            <label>Floor Distance</label>
            <span>50"</span>
          </div>
          <div className="value-box">
            <label>Niche Depth Var</label>
            <span>0.5"</span>
          </div>
        </div>
      </div>
      <div className="small-box">
        <h1>Description</h1>
        <div className="option-container">
          <label>Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
        </div>

        <div className="option-container">
          <label>Drawer</label>
          <input
            type="text"
            value={designerName}
            onChange={(e) => setDesignerName(e.target.value)}
          />
        </div>

        <div className="option-container">
          <label>Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div className="option-container">
          <label>Screen Size</label>
          <input
            type="text"
            value={screenSize}
            onChange={(e) => setScreenSize(e.target.value)}
          />
        </div>

        <div className="option-container">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button onClick={handleDownloadPDF}> Download ⤓</button>
      </div>
    </div>
  );
};

export default App;
