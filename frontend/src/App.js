import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Papa from "papaparse";
import "./styles.css";
import "./App.css";
import html2canvas from "html2canvas";
import logoimg from "./assets/logo_web-1.png";

const App = () => {
  // State variables
  const canvasRef = useRef(null);
  const [screenDimensions, setScreenDimensions] = useState({
    width: 50,
    height: 30,
    depth: 5,
  });
  const [gap, setGap] = useState(2);
  const [screenModel, setScreenModel] = useState("");
  const [mountType, setMountType] = useState("");
  const [mediaPlayer, setMediaPlayer] = useState("");
  const [receptacleBox, setReceptacleBox] = useState("");
 
  const [projectTitle, setProjectTitle] = useState("");
  const [screenDepth, setScreenDepth] = useState(3); // Default screen depth
  const [designerName, setDesignerName] = useState("");
  const [department, setDepartment] = useState("");
  const [screenSize, setScreenSize] = useState(55);
  const [floorDistance, setFloorDistance] = useState(50);
  const [nicheDepth, setNicheDepth] = useState(0.5);
  const [date, setDate] = useState("");
  const [mediaPlayerDepth, setMediaPlayerDepth] = useState(3);
  const [mountDepth, setMountDepth] = useState(2);
  const nicheDepthVar = screenSize > 55 ? 2 : 1.5;
  // const calculatedNicheDepth = nicheDepth + nicheDepthVar;
  const [depthVariance, setDepthVariance] = useState(0.5); // Default for under 55"
  const [isCanvasReady, setIsCanvasReady] = useState(false); // Flag to check if the canvas is ready

  // State to hold parsed data from each API
  const [pdfData, setPdfData] = useState([]);
  const [mountData, setMountData] = useState([]);
  const [mediaPlayerData, setMediaPlayerData] = useState([]);
  const [receptacleBoxData, setReceptacleBoxData] = useState([]);
  const [orientation, setOrientation] = useState("Vertical"); // Default to Vertical
  const [wallType, setWallType] = useState("Flat Wall"); // Default to Flat Wall

  // const calculatedNicheDepth = screenSize > 55 ? 2 : 1.5; // Default to 1.5" or 2" based on screen size

  const nicheAdjustment =
    screenDepth + Math.max(mediaPlayerDepth, mountDepth) + depthVariance;

  const calculatedNicheDepth =
    Number(screenDepth) +
    Math.max(Number(mediaPlayerDepth), Number(mountDepth)) +
    Number(depthVariance);
  const finalNicheDepth = wallType === "Niche" ? nicheAdjustment : 0;
  //API Calling
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Screen dimensions based on input (assuming screenSize in inches)
    const screenInches = parseInt(screenSize, 10) || 55; // Default to 55"
    const scale = 5; // Scale factor for converting inches to pixels
    const screenWidth =
      orientation === "Horizontal"
        ? screenInches * scale
        : screenInches * scale * 0.75;
    const screenHeight =
      orientation === "Horizontal"
        ? screenInches * scale * 0.75
        : screenInches * scale;

    const screenX = 250;
    const screenY = 600 - floorDistance; // Adjust position based on floor distance

    // Niche Depth Calculation
    const depthSidePadding = screenInches <= 55 ? 1.5 : 2; // Padding based on screen size
    const calculatedNicheDepth =
      screenDepth + Math.max(mediaPlayerDepth, mountDepth) + depthVariance;

    // Draw screen rectangle
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY - screenHeight, screenWidth, screenHeight);
    ctx.font = "14px Arial";
    ctx.fillText(
      `Screen: ${screenModel}`,
      screenX + 10,
      screenY - screenHeight - 10
    );
    ctx.fillText(
      `Size: ${screenSize}"`,
      screenX + 10,
      screenY - screenHeight + 20
    );

    // Draw niche (outer rectangle for recessed screens)
    if (wallType === "Niche") {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "grey";
      ctx.strokeRect(
        screenX - depthSidePadding * scale,
        screenY - screenHeight - depthSidePadding * scale,
        screenWidth + 2 * depthSidePadding * scale,
        screenHeight + 2 * depthSidePadding * scale
      );
      ctx.setLineDash([]);
      ctx.fillText(
        `Niche Depth: ${calculatedNicheDepth}"`,
        screenX - 80,
        screenY - screenHeight / 2
      );
    }

    // Power outlet (dashed box)
    ctx.strokeStyle = "blue";
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(200, 450, 100, 50);
    ctx.setLineDash([]);
    ctx.fillText("Power Outlet", 210, 440);

    // Floor distance line
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(screenX + screenWidth / 2, screenY);
    ctx.lineTo(screenX + screenWidth / 2, 600); // Floor
    ctx.stroke();
    ctx.fillText(
      `Floor Distance: ${floorDistance}"`,
      screenX + screenWidth / 2 + 10,
      screenY + 10
    );

    setIsCanvasReady(true); // Enable download button
  }, [
    screenSize,
    screenDepth,
    mediaPlayerDepth,
    mountDepth,
    depthVariance,
    floorDistance,
    wallType,
    orientation,
    screenModel,
  ]);

  const addCanvasBackground = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.save();
  
    // Fill the canvas with a white background
    ctx.globalCompositeOperation = "destination-over"; // Draw background "under" existing content
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.restore();
  };
  

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

     // Add white background to the canvas
  addCanvasBackground(canvas);
    // Calculate Niche Depth before using it
    const calculatedNicheDepth =
      Number(screenDepth) +
      Math.max(Number(mediaPlayerDepth), Number(mountDepth)) +
      Number(depthVariance);

    // Initialize jsPDF instance
    const doc = new jsPDF();

    // Add diagram image from canvas
    doc.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 10, 20, 180, 130);

    // Add the configuration details
    doc.setFontSize(12);
    doc.text("Configuration Details:", 10, 160);
    doc.text(`Screen Model: ${screenModel}`, 10, 170);
    doc.text(`Media Player: ${mediaPlayer}`, 10, 180);
    doc.text(`Mount Type: ${mountType}`, 10, 190);
    doc.text(`Wall Type: ${wallType}`, 10, 200);
    doc.text(`Orientation: ${orientation}`, 10, 210);
    doc.text(`Floor Distance: ${floorDistance}"`, 10, 220);
    doc.text(`Screen Size: ${screenSize}"`, 10, 230);
    doc.text(`Screen Depth: ${screenDepth}"`, 10, 240);
    doc.text(`Media Player Depth: ${mediaPlayerDepth}"`, 10, 250);
    doc.text(`Mount Depth: ${mountDepth}"`, 10, 260);
    doc.text(`Depth Variance: ${depthVariance}"`, 10, 270);

    // Add the Niche Depth calculation and result
    doc.text("Niche Depth Calculation:", 10, 280);
    doc.text(
      "Niche Depth = Screen Depth + Max(Media Player Depth, Mount Depth) + Depth Variance",
      10,
      290
    );
    doc.text(`Niche Depth: ${calculatedNicheDepth}"`, 10, 300);

    // Save the PDF
    doc.save("updated_diagram.pdf");
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 2fr",
                alignItems: "center",
                padding: "10px",
                gap: "10px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src={logoimg}
                  alt="SignCast Logo"
                  style={{ height: "40px", objectFit: "contain" }}
                />
              </div>

              <div style={{ textAlign: "center", lineHeight: "1.5" }}>
                <strong>361 Steelcase RD. W, #1,</strong>
                <br />
                MARKHAM, ONTARIO
                <br />
                Phone: (416) 900-2233
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                Description:
                <br />
                Horizontal + PC In Niche
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
                display: "table",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              {/* Table Header */}
              <div style={{ display: "table-row" }}>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Drawn
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Dimensions In Inches
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  {/* Empty column for alignment */}
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Screen Size
                </div>
              </div>

              {/* Table Content Row 1 */}
              <div style={{ display: "table-row" }}>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  SignCast
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                    textAlign: "center",
                  }}
                >
                  {/* Circular Shape */}
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "2px solid #333",
                      borderRadius: "50%",
                      margin: "0 auto",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: "50%",
                        height: "4px",
                        backgroundColor: "#333",
                        top: "50%",
                        left: "0",
                        transform: "translateY(-50%)",
                      }}
                    ></div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  {/* Empty column */}
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  LG 55” Touch Display
                </div>
              </div>

              {/* Table Header Row 2 */}
              <div style={{ display: "table-row" }}>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Date
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Sheet
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Revision
                </div>
                <div
                  style={{
                    backgroundColor: "#f6d89b",
                    fontWeight: "bold",
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Department
                </div>
              </div>

              {/* Table Content Row 2 */}
              <div style={{ display: "table-row" }}>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  09/12/2023
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  1 of 1
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  00
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                >
                  Installations
                </div>
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
        <div>
          <label>Depth Variance:</label>
          <input
            type="number"
            value={depthVariance}
            onChange={(e) => setDepthVariance(Number(e.target.value))}
          />
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
        <div>
          <label>Floor Distance:</label>
          <input
            type="number"
            value={floorDistance}
            onChange={(e) => setFloorDistance(Number(e.target.value))}
          />
        </div>

        <div>
          <label>Niche Depth:</label>
          <input
            type="number"
            value={nicheDepth}
            onChange={(e) => setNicheDepth(Number(e.target.value))}
          />
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
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ display: "none" }}
        ></canvas>
        <button onClick={handleDownloadPDF} disabled={!isCanvasReady}>
          {" "}
          Download ⤓
        </button>
      </div>
    </div>
  );
};

export default App;
