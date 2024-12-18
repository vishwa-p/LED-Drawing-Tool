import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Papa from "papaparse";
import "./styles.css";
import "./App.css";

import logoimg from "./assets/logo_web-1.png";

const App = () => {
  const canvasRef = useRef(null);

  const [screenModel, setScreenModel] = useState("");
  const [mountType, setMountType] = useState("");
  const [mediaPlayer, setMediaPlayer] = useState("");
  const [receptacleBox, setReceptacleBox] = useState("");

  const [projectTitle, setProjectTitle] = useState("");
  const [screenDepth, setScreenDepth] = useState(3);
  const [designerName, setDesignerName] = useState("");
  const [department, setDepartment] = useState("");
  const [screenSize, setScreenSize] = useState(55);
  const [floorDistance, setFloorDistance] = useState(50);
  const [nicheDepth, setNicheDepth] = useState(0.5);
  const [date, setDate] = useState("");
  const [mediaPlayerDepth, setMediaPlayerDepth] = useState(3);
  const [mountDepth, setMountDepth] = useState(2);

  const [depthVariance, setDepthVariance] = useState(0.5);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const [pdfData, setPdfData] = useState([]);
  const [mountData, setMountData] = useState([]);
  const [mediaPlayerData, setMediaPlayerData] = useState([]);
  const [receptacleBoxData, setReceptacleBoxData] = useState([]);
  const [orientation, setOrientation] = useState("Vertical");
  const [wallType, setWallType] = useState("Flat Wall");

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

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(screenX + screenWidth / 2, screenY);
    ctx.lineTo(screenX + screenWidth / 2, 600);
    ctx.stroke();
    ctx.fillText(
      `Floor Distance: ${floorDistance}"`,
      screenX + screenWidth / 2 + 10,
      screenY + 10
    );

    setIsCanvasReady(true);
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

    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    addCanvasBackground(canvas);

    const calculatedNicheDepth =
      Number(screenDepth) +
      Math.max(Number(mediaPlayerDepth), Number(mountDepth)) +
      Number(depthVariance);

    const doc = new jsPDF();

    doc.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 10, 20, 180, 130);

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

    doc.text("Niche Depth Calculation:", 10, 280);
    doc.text(
      "Niche Depth = Screen Depth + Max(Media Player Depth, Mount Depth) + Depth Variance",
      10,
      290
    );
    doc.text(`Niche Depth: ${calculatedNicheDepth}"`, 10, 300);

    doc.save("updated_diagram.pdf");
  };

  const uniqueMediaPlayers = [
    ...new Set(mediaPlayerData.map((item) => item["MFGPART"])),
  ];

  return (
    <div className="container">
      <div className="large-box" style={{ display: "flex", gap: "20px" }}>
        <div
          className="Diagram"
          style={{ flex: 2, border: "1px solid black", padding: "10px" }}
        >
          <canvas ref={canvasRef} width={500} height={700} />
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
                ></div>
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
                  <div
                    style={{
                      width: "30px",
                      height: "30px",

                      borderRadius: "50%",
                      margin: "0 auto",
                      position: "relative",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    display: "table-cell",
                  }}
                ></div>
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

        <button onClick={handleDownloadPDF} disabled={!isCanvasReady}>
          {" "}
          Download ⤓
        </button>
      </div>
    </div>
  );
};

export default App;
