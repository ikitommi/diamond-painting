document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadColorChartBtn = document.getElementById('downloadColorChartBtn');
    const originalImageContainer = document.getElementById('originalImageContainer');
    const patternContainer = document.getElementById('patternContainer');
    const rowsSlider = document.getElementById('rowsSlider');
    const rowsValue = document.getElementById('rowsValue');
    const colorsSlider = document.getElementById('colorsSlider');
    const colorsValue = document.getElementById('colorsValue');
    const downloadSection = document.querySelector('.download-section');
    const showGridCheckbox = document.getElementById('showGrid');
    const showSymbolsCheckbox = document.getElementById('showSymbols');
    const showColorsCheckbox = document.getElementById('showColors');
    
    // Update the displayed values when sliders change
    rowsSlider.addEventListener('input', function() {
        rowsValue.textContent = this.value;
    });
    
    colorsSlider.addEventListener('input', function() {
        colorsValue.textContent = this.value;
    });
    
    // Variables to store the current state
    let originalImage = null;
    let patternCanvas = null;
    let colorMap = null;
    let patternData = null;
    
    // Symbols for diamond painting
    const SYMBOLS = [
        '■', '□', '♥', '♦', '♣', '♠', '●', '○', '◎', '◉', '◍', '◌', '◯',
        '★', '☆', '✧', '✦', '✪', '✫', '✯', '▲', '△', '▴', '▵', '▶', '▷',
        '▸', '▹', '◆', '◇', '◈', '◊', '⧫', '⧪', '✚', '✖', '✜', '✛', '✙',
        '✠', '▼', '▽', '▾', '▿', '◢', '◣', '◤', '◥', '◐', '◑', '◒', '◓',
        '◔', '◕', '◖', '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠',
        '◡', '◦', '◧', '◨', '◩', '◪', '◫', '◬', '◭', '◮', '◰', '◱', '◲',
        '◳', '◴', '◵', '◶', '◷', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ',
        'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ',
        'χ', 'ψ', 'ω', 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К',
        'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч',
        'Ш', 'Щ', 'Э', 'Ю', 'Я', '0', '1', '2', '3', '4', '5', '6', '7',
        '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
        'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
        'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z', '!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '+',
        '=', '[', ']', '{', '}', '|', '\\', ':', ';', '"', '\'', '<', '>',
        ',', '.', '?', '/'
    ];
    
    // Event listeners
    imageUpload.addEventListener('change', handleImageUpload);
    generateBtn.addEventListener('click', generatePattern);
    downloadBtn.addEventListener('click', downloadPattern);
    showGridCheckbox.addEventListener('change', updatePatternDisplay);
    showSymbolsCheckbox.addEventListener('change', updatePatternDisplay);
    showColorsCheckbox.addEventListener('change', updatePatternDisplay);
    
    // Handle image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                originalImage = img;
                displayOriginalImage(img);
                generateBtn.disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Display the original image
    function displayOriginalImage(img) {
        originalImageContainer.innerHTML = '';
        const displayImg = img.cloneNode();
        displayImg.style.maxWidth = '100%';
        displayImg.style.maxHeight = '100%';
        originalImageContainer.appendChild(displayImg);
    }
    
    // Generate the diamond painting pattern
    function generatePattern() {
        if (!originalImage) return;
        
        const rows = parseInt(rowsSlider.value);
        const colorCount = parseInt(colorsSlider.value);
        
        // Calculate width based on aspect ratio
        const aspectRatio = originalImage.width / originalImage.height;
        const width = Math.round(rows * aspectRatio);
        const height = rows;
        
        // Create a canvas for the pattern
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw the image on the canvas, maintaining aspect ratio
        ctx.drawImage(originalImage, 0, 0, width, height);
        
        // Get the image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Reduce colors using k-means clustering
        const pixels = [];
        for (let i = 0; i < data.length; i += 4) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        
        const { centroids, assignments } = kMeans(pixels, colorCount, 10);
        
        // Create color mapping with symbols
        const colorMapping = centroids.map((centroid, index) => {
            const hexColor = rgbToHex(centroid[0], centroid[1], centroid[2]);
            return {
                hex: hexColor,
                code: `C-${index + 1}`,
                symbol: SYMBOLS[index % SYMBOLS.length]
            };
        });
        
        colorMap = colorMapping;
        
        // Store pattern data for later use
        patternData = {
            width,
            height,
            assignments,
            colorMapping
        };
        
        // Generate and display the pattern
        updatePatternDisplay();
        
        // Show download section
        downloadSection.style.display = 'block';
    }
    
    // New function to update the pattern display based on current settings
    function updatePatternDisplay() {
        if (!patternData) return;
        
        const { width, height, assignments, colorMapping } = patternData;
        const showGrid = showGridCheckbox.checked;
        const showSymbols = showSymbolsCheckbox.checked;
        const showColors = showColorsCheckbox.checked;
        
        // Create the pattern canvas with grid and symbols
        const canvas = document.createElement('canvas');
        const cellSize = 12; // Each cell is 12x12 pixels
        const patternWidth = width * cellSize;
        const patternHeight = height * cellSize;
        canvas.width = patternWidth;
        canvas.height = patternHeight;
        const patternCtx = canvas.getContext('2d');
        
        // Draw the pattern
        patternCtx.fillStyle = 'white';
        patternCtx.fillRect(0, 0, patternWidth, patternHeight);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x);
                const colorIndex = assignments[index];
                const color = colorMapping[colorIndex];
                
                // Draw the colored cell if colors are enabled
                if (showColors) {
                    patternCtx.fillStyle = color.hex;
                    patternCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                } else {
                    patternCtx.fillStyle = 'white';
                    patternCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
                
                // Draw the symbol if symbols are enabled
                if (showSymbols) {
                    patternCtx.fillStyle = showColors ? getContrastColor(color.hex) : 'black';
                    patternCtx.font = '9px Arial';
                    patternCtx.textAlign = 'center';
                    patternCtx.textBaseline = 'middle';
                    patternCtx.fillText(color.symbol, x * cellSize + cellSize/2, y * cellSize + cellSize/2);
                }
                
                // Draw the grid if grid is enabled
                if (showGrid) {
                    // Draw regular grid lines
                    patternCtx.strokeStyle = '#ccc';
                    patternCtx.lineWidth = 0.5;
                    patternCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    
                    // Draw thicker grid lines every 10 cells
                    if (x % 10 === 0 || y % 10 === 0) {
                        patternCtx.strokeStyle = '#888';
                        patternCtx.lineWidth = 1;
                        patternCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    }
                }
            }
        }
        
        // Display the pattern
        patternContainer.innerHTML = '';
        patternContainer.appendChild(canvas);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        
        // Store the pattern canvas for download
        patternCanvas = canvas;
    }
    
    // Update the download function to include bead counts
    function downloadPattern() {
        if (!patternData || !colorMap) return;
        
        // Temporarily store current settings
        const showGridState = showGridCheckbox.checked;
        const showSymbolsState = showSymbolsCheckbox.checked;
        const showColorsState = showColorsCheckbox.checked;
        
        // Enable all features for the download
        showGridCheckbox.checked = true;
        showSymbolsCheckbox.checked = true;
        showColorsCheckbox.checked = true;
        
        // Update the pattern with all features
        updatePatternDisplay();
        
        // Create a zip file containing both the pattern and color chart
        const zip = new JSZip();
        
        // Add the pattern image to the zip
        patternCanvas.toBlob(function(blob) {
            zip.file("diamond-painting-pattern.png", blob);
            
            // Count beads for each color
            const beadCounts = {};
            const { assignments } = patternData;
            
            // Count occurrences of each color
            assignments.forEach(colorIndex => {
                const color = colorMap[colorIndex];
                if (!beadCounts[color.hex]) {
                    beadCounts[color.hex] = 1;
                } else {
                    beadCounts[color.hex]++;
                }
            });
            
            // Create the color chart with bead counts
            let chartContent = 'Diamond Painting Color Chart\n\n';
            chartContent += 'Symbol,Color Code,Hex Color,Beads Needed\n';
            
            // Create a Set to track unique colors used
            const uniqueColors = new Set();
            colorMap.forEach(color => {
                uniqueColors.add(color.hex);
            });
            
            // Add each unique color to the chart with bead count
            Array.from(uniqueColors).forEach(hex => {
                const color = colorMap.find(c => c.hex === hex);
                const beadCount = beadCounts[hex] || 0;
                chartContent += `${color.symbol},${color.code},${color.hex},${beadCount}\n`;
            });
            
            // Add the color chart to the zip
            zip.file("diamond-painting-color-chart.csv", chartContent);
            
            // Generate the zip file and trigger download
            zip.generateAsync({type:"blob"}).then(function(content) {
                const link = document.createElement('a');
                link.download = 'diamond-painting-pattern.zip';
                link.href = URL.createObjectURL(content);
                link.click();
                
                // Restore original settings
                showGridCheckbox.checked = showGridState;
                showSymbolsCheckbox.checked = showSymbolsState;
                showColorsCheckbox.checked = showColorsState;
                
                // Update the display back to original settings
                updatePatternDisplay();
            });
        });
    }
    
    // K-means clustering algorithm
    function kMeans(data, k, iterations) {
        // Initialize centroids randomly
        let centroids = [];
        const dataLength = data.length;
        const randomIndices = new Set();
        
        // Choose k random unique points as initial centroids
        while (randomIndices.size < k) {
            randomIndices.add(Math.floor(Math.random() * dataLength));
        }
        
        centroids = Array.from(randomIndices).map(index => data[index]);
        
        let assignments = [];
        
        // Run iterations
        for (let iter = 0; iter < iterations; iter++) {
            // Assign points to centroids
            assignments = data.map(point => {
                let minDist = Infinity;
                let minIndex = 0;
                
                for (let i = 0; i < centroids.length; i++) {
                    const dist = distance(point, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        minIndex = i;
                    }
                }
                
                return minIndex;
            });
            
            // Update centroids
            const newCentroids = Array(k).fill().map(() => [0, 0, 0]);
            const counts = Array(k).fill(0);
            
            for (let i = 0; i < data.length; i++) {
                const centroidIndex = assignments[i];
                const point = data[i];
                
                newCentroids[centroidIndex][0] += point[0];
                newCentroids[centroidIndex][1] += point[1];
                newCentroids[centroidIndex][2] += point[2];
                counts[centroidIndex]++;
            }
            
            for (let i = 0; i < k; i++) {
                if (counts[i] !== 0) {
                    newCentroids[i][0] = Math.round(newCentroids[i][0] / counts[i]);
                    newCentroids[i][1] = Math.round(newCentroids[i][1] / counts[i]);
                    newCentroids[i][2] = Math.round(newCentroids[i][2] / counts[i]);
                } else {
                    // If a centroid has no points, keep the old one
                    newCentroids[i] = centroids[i];
                }
            }
            
            centroids = newCentroids;
        }
        
        return { centroids, assignments };
    }
    
    // Calculate Euclidean distance between two points
    function distance(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2) +
            Math.pow(a[2] - b[2], 2)
        );
    }
    
    // Convert RGB to hex
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // Convert hex color to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Get contrasting color (black or white) for text
    function getContrastColor(hexColor) {
        const rgb = hexToRgb(hexColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? 'black' : 'white';
    }
}); 