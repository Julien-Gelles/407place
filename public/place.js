document.addEventListener("DOMContentLoaded", () => {
  //---variables&init---

  //socket
  let socket = io();
  let loading = true;
  let wattouat = false;
  
  //cursor
  const img = new Image();
  img.src =
    "https://cdn.glitch.global/441cb9ad-909f-4db2-844d-259dcdbc2bb1/cursor.png?v=1671569199131";

  //canvas1
  const canvas = document.getElementById("canvas");
  const drawingContext = canvas.getContext("2d", { willReadFrequently: true });
  drawingContext.fillStyle = "#fafafa";
  drawingContext.fillRect(0, 0, canvas.width, canvas.height);

  //canvas2
  const canvas2 = document.getElementById("canvas2");
  const drawingContext2 = canvas2.getContext("2d");
  drawingContext2.fillStyle = "rgb(0,0,0,0)";
  drawingContext2.fillRect(0, 0, canvas.width, canvas.height);
  drawingContext2.imageSmoothingEnabled = false;

  //coords section
  const axes = document.getElementsByClassName("axes")[0];
  const xcoord = document.getElementById("x-coord");
  const ycoord = document.getElementById("y-coord");
  let cursorPos = { x: null, y: null };

  //commands section
  const commands = document.getElementsByClassName("commands")[0];

  //cells params
  const CELL_SIDE_COUNT = 250;
  const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
  let scale = 0.1;

  //color menu & buttons
  const lis = document.getElementsByTagName("li");
  const buttons = [
    document.getElementById("darkBrown"),
    document.getElementById("brown"),
    document.getElementById("red"),
    document.getElementById("darkOrange"),
    document.getElementById("orange"),
    document.getElementById("yellow"),
    document.getElementById("lightGreen"),
    document.getElementById("green"),
    document.getElementById("darkGreen"),
    document.getElementById("cyan"),
    document.getElementById("lightBlue"),
    document.getElementById("blue"),
    document.getElementById("darkBlue"),
    document.getElementById("darkPurple"),
    document.getElementById("purple"),
    document.getElementById("pink"),
    document.getElementById("lightPink"),
    document.getElementById("beige"),
    document.getElementById("white"),
    document.getElementById("lightGrey"),
    document.getElementById("grey"),
    document.getElementById("black"),
  ];

  //colors
  const colors = [
    "rgb(73,41,20)",
    "rgb(122,63,23)",
    "rgb(188,26,26)",
    "rgb(202,84,29)",
    "rgb(255,169,40)",
    "rgb(255,235,53)",
    "rgb(131,188,26)",
    "rgb(30,167,17)",
    "rgb(9,104,0)",
    "rgb(1,177,133)",
    "rgb(120,212,255)",
    "rgb(56,97,235)",
    "rgb(1,37,156)",
    "rgb(32,0,45)",
    "rgb(142,26,188)",
    "rgb(188,26,166)",
    "rgb(255,168,243)",
    "rgb(246,225,207)",
    "rgb(250,250,250)",
    "rgb(165,162,162)",
    "rgb(99,96,96)",
    "rgb(14,13,13)",
  ];
  let color;

  //---functions---

  //get click coords
  function mousedownCoord(e) {
    const canvasBoundingRect = canvas.getBoundingClientRect();
    const x = (e.clientX - canvasBoundingRect.left) / scale;
    const y = (e.clientY - canvasBoundingRect.top) / scale;
    const cellX = Math.floor(x / cellPixelLength);
    const cellY = Math.floor(y / cellPixelLength);
    cursorPos.x = cellX;
    cursorPos.y = cellY;
    xcoord.innerHTML = cellX;
    ycoord.innerHTML = cellY;
    return cursorPos;
  }

  //draw pixel
  function fillCell(coord, color) {
    const x = coord % CELL_SIDE_COUNT;
    const y = Math.floor(coord / CELL_SIDE_COUNT);
    const startX = x * cellPixelLength;
    const startY = y * cellPixelLength;
    drawingContext.fillStyle = color;
    drawingContext.fillRect(startX, startY, cellPixelLength, cellPixelLength);
  }

  //draw cursor
  function cursorCell(cells) {
    const startX = cells.x * cellPixelLength;
    const startY = cells.y * cellPixelLength;
    drawingContext2.clearRect(0, 0, canvas.width, canvas.height);
    drawingContext2.drawImage(
      img,
      startX,
      startY,
      cellPixelLength,
      cellPixelLength
    );
  }

  //colors selection switch
  function colorSelection(i) {
    for (let j = 0; j < buttons.length; j++) {
      buttons[j].classList.remove("selected");
    }
    buttons[i].classList.add("selected");
  }

  //get & change current color
  function getColor(x, y) {
    let clr = drawingContext.getImageData(
      x * cellPixelLength + cellPixelLength / 2,
      y * cellPixelLength + cellPixelLength / 2,
      1,
      1
    ).data;
    let clrStr = "rgb(" + clr[0] + "," + clr[1] + "," + clr[2] + ")";
    colorSelection(colors.indexOf(clrStr));
    color = clrStr;
  }

  //---eventListeners---

  //left click
  document.body.addEventListener("click", function (e) {
    if (!loading) {
      if (e.target.tagName == "CANVAS") {
        cursorCell(mousedownCoord(e));
        getColor(cursorPos.x, cursorPos.y);
        axes.classList.remove("hidden");
        for (let child of document.getElementsByClassName("commands")[0]
          .children) {
          child.classList.remove("hidden");
        }
        for (let li of lis) {
          li.removeAttribute("hidden");
        }
      } else if (e.target == document.getElementById("zoom_outer")) {
        drawingContext2.clearRect(0, 0, canvas.width, canvas.height);
        axes.classList.add("hidden");
        for (let child of document.getElementsByClassName("commands")[0]
          .children) {
          child.classList.add("hidden");
        }
        for (let li of lis) {
          li.setAttribute("hidden", "hidden");
        }
      }
    }
  });

  //right click
  canvas2.addEventListener(
    "contextmenu",
    function (e) {
      if (!loading && color) {
        cursorCell(mousedownCoord(e));
        socket.emit("addPixel", {
          coord: cursorPos.y * CELL_SIDE_COUNT + cursorPos.x,
          color: color,
        });
        colorSelection(colors.indexOf(color));
      }
      e.preventDefault();
    },
    false
  );

  //color buttons click
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => {
      if (!loading && cursorPos.x && cursorPos.y) {
        color = colors[i];
        colorSelection(i);
        socket.emit("addPixel", {
          coord: cursorPos.y * CELL_SIDE_COUNT + cursorPos.x,
          color: color,
        });
      }
    });
  }

  //commands hide
  commands.addEventListener("click", () => {
    if (!loading) {
      commands.style.border = "none";
      for (let child of document.getElementsByClassName("commands")[0]
        .children) {
        child.classList.add("overhidden");
      }
    }
  });
  
  axes.addEventListener("click", () => {
     if (!loading ){
       if (wattouat){
         document.body.style.backgroundImage = null;
         wattouat = false;
       }else{
         document.body.style.backgroundImage = "url(https://cdn.glitch.global/441cb9ad-909f-4db2-844d-259dcdbc2bb1/getwattouated.png?v=1671923345465)";
         wattouat = true;
       }
       
     }
  });

  //---socket.io---

  //init dataURL
  socket.on("drawCanvasDataURL", (dataURL) => {
    let img = new Image();
    img.src = dataURL.t;
    img.onload = function () {
      drawingContext.drawImage(img, 0, 0);
    };
    socket.emit("dataURldone");
  });

  //init canvas
  socket.on("drawInitPixels", (datas) => {
    let transitPixels = new Map(JSON.parse(datas));
    transitPixels.forEach((value, key) => {
      fillCell(key, value);
    });
    loading = false;
    document.getElementById("loading").remove();
    document.getElementById("loadingScreen").remove();
    canvas2.style.cursor = "crosshair";
    buttons.forEach((a) => {
      a.style.cursor = "grab";
    });
  });

  //draw pixel
  socket.on("drawPixel", (data) => {
    fillCell(data.coord, data.color);
  });

  //---moveCanvas---
  let panning = false,
    zoom = document.getElementById("zoom"),
    pointX = window.innerWidth / 2 - (canvas.width / 2) * scale,
    pointY = window.innerHeight / 2 - (canvas.width / 2) * scale,
    start = { x: 0, y: 0 };

  function setTransform() {
    zoom.style.transform =
      "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";
  }

  zoom.onmousedown = function (e) {
    if (!loading) {
      if (e.button !== 1) {
        return;
      }
      e.preventDefault();
      document.getElementById("canvas2").style.cursor = "grab";
      start = { x: e.clientX - pointX, y: e.clientY - pointY };
      panning = true;
    }
  };

  document.onmouseup = function (e) {
    if (e.button !== 1) {
      return;
    }
    document.getElementById("canvas2").style.cursor = "crosshair";
    panning = false;
  };

  document.onmousemove = function (e) {
    e.preventDefault();
    if (!panning) {
      return;
    }
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    setTransform();
  };

  zoom.onwheel = function (e) {
    if (!loading) {
      e.preventDefault();
      let xs = (e.clientX - pointX) / scale,
        ys = (e.clientY - pointY) / scale,
        delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
      if (delta > 0 && scale < 1.5) {
        scale *= 1.2;
      }
      if (delta < 0 && scale > 0.1) {
        scale /= 1.2;
      }
      pointX = e.clientX - xs * scale;
      pointY = e.clientY - ys * scale;
      setTransform();
    }
  };
  setTransform();
});
