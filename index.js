'use strict';

const fs = require('fs');
const util = require('util');


// --------------------------------------------------- //
// ------------------ BITMAP CLASS ------------------- //
// --------------------------------------------------- //
class Bitmap{
  constructor(filePath){
    this.rawBuffer;
    this.file = filePath;
    this.dataArrAscii = [];
    this.pixelData = [];
    this.headerData = [];
    this.headerDataBuffer;
    this.dataArr = [];
    this.pixelStartIndex = 0;
    this.width = 0;
    this.height = 0;
    this.bitsPerPixel = 0;
    this.hexCharsPerRow = 0;
    this.paddingCharsNeeded = 0;
    this.totalRowLength = 0;
    this.rows = 0;

    this.transformedArray = [];
  }

  // Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
  parse (buffer){

  }

  // Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
  //  all this does is make a file
  transform (operation){
    // call the transform function specified in the CLI ('operation')
    // pass the CLI option param to the function (i.e. borderWidth)
    transforms[operation](this, paramA, paramB, paramC);

    // make a new file path, append operation into the file name
    this.newFile = this.file.replace(/\.bmp/, `.${operation}.bmp`);
  }

  makeDataArr(buffer){
    this.buffer = buffer;
    for (let i = 0; i < buffer.length; i++){
      this.dataArr.push(buffer[i].toString(16));
    }
  }

  parseHeaderInfo(){
    for (let i = 0; i < 2; i++){
      let ascidata = String.fromCharCode(parseInt(this.dataArr[i],16));
      this.dataArrAscii.push(ascidata);
    }

    this.headerTitle = this.dataArrAscii.join('');
    if (this.headerTitle === 'BM'){
      this.pixelStartIndex = parseInt(this.dataArr[10], 16);
  
      // width
      this.width = parseInt(this.dataArr[18], 16);
      
      // height
      this.height = parseInt(this.dataArr[22], 16); // header data is wrong
  
      // bitsPerPixel
      this.bitsPerPixel = parseInt(this.dataArr[28], 16);
      this.hexCharsPerRow = this.width * (this.bitsPerPixel/8);  // 330 for test image
      this.paddingCharsNeeded = this.hexCharsPerRow % 4;    // 2 for test image
      this.totalRowLength = this.hexCharsPerRow + this.paddingCharsNeeded; // 332 for test image
      this.rows = (this.dataArr.length - this.pixelStartIndex) / this.totalRowLength;
    }

  }

  makePixelArray(){
    for(let i = this.pixelStartIndex; i<this.dataArr.length; i++){
      if(this.dataArr[i].length < 2){
        this.dataArr[i] = '0'+this.dataArr[i];
      }
    }
    
    // copy the dataArr into a temporary array, with pixel data only (no header data)
    const tempArr = [];
    for (let i = this.pixelStartIndex; i < this.dataArr.length; i++){
      tempArr.push(this.dataArr[i]);
    }

    // turns all padding to 'x' to make it easier to handle
    if (this.paddingCharsNeeded > 0){
      for(let i = this.hexCharsPerRow; i <= tempArr.length; i+= this.totalRowLength) {
        tempArr[i] = 'x';
        tempArr[i+1] = 'x';
      }
    }

    // remove all padding
    let tempArrNoPadding = [];
    for (let i = 0; i < tempArr.length; i++){
      if (tempArr[i] !== 'x'){
        tempArrNoPadding.push(tempArr[i]);
      }
    }
    // create row arrays
    for (let i = 0; i < this.rows; i++){
      // fill a single row array
      let rowArraySingles = [];
      for(let j = 0; j < this.hexCharsPerRow; j++){
        let index = (i * this.hexCharsPerRow) + j;
        rowArraySingles.push(tempArrNoPadding[index]);
      }

      // group the pixel data
      let rowArrayGrouped = [];
      for (let j = 0; j < rowArraySingles.length; j+= this.bitsPerPixel / 8){
        let pixelRGB = '';
        if (this.bitsPerPixel === 24){
          pixelRGB += rowArraySingles[j] + rowArraySingles[j+1] + rowArraySingles[j+2];
        } else if (this.bitsPerPixel === 32){
          pixelRGB += rowArraySingles[j] + rowArraySingles[j+1] + rowArraySingles[j+2] + rowArraySingles[j+3];
        }

        rowArrayGrouped.push(pixelRGB);
      }

      // add to pixelData
      this.pixelData.push(rowArrayGrouped);
    }
  }

  makeheader(){

    // creates an array with just the header info
    for (let i = 0; i < this.pixelStartIndex; i ++){
      this.headerData.push('0x' + this.dataArr[i]);
    }

    // creates a header buffer with the same data
    this.headerDataBuffer = Buffer.from(this.headerData, 16);
  }

  addHexPreFix(){
    let joinedStr = this.transformedArray.join();
    let joinedArr = joinedStr.split(',');
  
    const changedArr = [];
  
    for(let i = 0; i < joinedArr.length; i++){
  
      if(joinedArr[i] === 'x' ){
        changedArr.push('0x00');
      } else if (this.bitsPerPixel === 24 ){
        changedArr.push('0x'+joinedArr[i][0]+joinedArr[i][1]);
        changedArr.push('0x'+joinedArr[i][2]+joinedArr[i][3]);
        changedArr.push('0x'+joinedArr[i][4]+joinedArr[i][5]);
      } else if (this.bitsPerPixel === 32){
        changedArr.push('0x'+joinedArr[i][0]+joinedArr[i][1]);
        changedArr.push('0x'+joinedArr[i][2]+joinedArr[i][3]);
        changedArr.push('0x'+joinedArr[i][4]+joinedArr[i][5]);
        changedArr.push('0x'+joinedArr[i][6]+joinedArr[i][7]);
      }
    }
    
    this.transformedArray = changedArr;
  }

  addPadding(){
    if (this.paddingCharsNeeded > 0){
      // for each row
      for (let i = 0; i < this.rows; i++){
        for(let j = 0; j < this.paddingCharsNeeded; j++){
          this.transformedArray[i].push('x');
        }
      }
    }
  }

  finalize(){
    let pixelDataBuffer = Buffer.from(this.transformedArray, 'hex');
    let joinedImageBuffer = Buffer.concat([this.headerDataBuffer, pixelDataBuffer]);

    return joinedImageBuffer;
  }
 
}


// ------------------------------------------------------ //
// ------------------ TRANSFORMATIONS ------------------- //
// ------------------------------------------------------ //
const transforms = {
  // greyscale: transformGreyscale,
  invert: invert,
  border: addBorder,
  blueWash: blueWash,
};

function addBorder(bitmapObj, borderWidth, borderColor){
  
  if(!borderColor){
    borderColor = '0000ff';
  }
  let imageWithBorder = bitmapObj.pixelData.slice();

  for (let y = 0; y < bitmapObj.rows; y++){
    for(let x = 0; x < bitmapObj.pixelData[0].length; x++){
      if(y < borderWidth || y > bitmapObj.rows-1-borderWidth){
        imageWithBorder[y][x] = borderColor;
      }
      if(x < borderWidth || x > bitmapObj.pixelData[0].length-1-borderWidth){
        imageWithBorder[y][x] = borderColor;
      }
    }
  }
  bitmapObj.transformedArray = imageWithBorder;
}

function blueWash(bitmapObj){
  //this line copies the original image array.
  let blueImage = bitmapObj.pixelData.slice();

  for (let y = 0; y < 110; y++){
    for(let x = 0; x < 125; x++){
      
      let blue = blueImage[x][y].replace(/../s, 'ff');
      blueImage[x][y] = blue;
    }
  }
  bitmapObj.transformedArray = blueImage;
}

function invert(bitmapObj){
  let inversion = bitmapObj.pixelData.slice();
  let ia = [];

  for(let y = 0; y < 110; y++){
    for(let x = 0; x < 125; x++){
      let b = inversion[x][y].slice(0,2);
      let db = parseInt(b,16);
      let binvert = 255 - db;
      let hbinvert = binvert.toString(16);


      let g = inversion[x][y].slice(2,4);
      let dg = parseInt(g,16);
      let ginvert = 255 - dg;
      let hginvert = ginvert.toString(16);


      let r = inversion[x][y].slice(4,6);
      let dr = parseInt(r,16);
      let rinvert = 255 - dr;
      let hrinvert = rinvert.toString(16);

      ia[0] = hbinvert;
      ia[1] = hginvert;
      ia[2] = hrinvert;

      let is = ia.join('');
      inversion[x][y] = is;
    
    }
  }
  bitmapObj.transformedArray = inversion;
}

// ---------------------------------------------------- //
// ------------------ MAIN RUN LOOP ------------------- //
// ---------------------------------------------------- //
function transformWithCallbacks() {

  fs.readFile(file, (err, buffer) => {
    if (err) { throw new Error(err); }

    // parse buffer and change the form of the data into arrays
    bitmap.makeDataArr(buffer);
    bitmap.parseHeaderInfo();
    bitmap.makePixelArray();
    bitmap.makeheader();
    
    // perform the transform specified
    bitmap.transform(operation);
    
    // change the modified arrays back into buffer form
    bitmap.addPadding();
    bitmap.addHexPreFix();
    const outputBuffer = bitmap.finalize();

    fs.writeFile(bitmap.newFile, outputBuffer, (err, out) => {
      if (err) { throw Error(err);}
    });

  });
}

// --------------------------------------------------- //
// ------------------ FIRST TO RUN ------------------- //
// --------------------------------------------------- //

// TODO: Explain how this works (in your README)
const [file, operation, paramA, paramB, paramC] = process.argv.slice(2);

// our global bitmap object
let bitmap = new Bitmap(file);

transformWithCallbacks();
