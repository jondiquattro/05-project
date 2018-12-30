'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

// const fileData3;
var streamArr =[];


//helpers
function pixelArrMaker(){
  for(let i = ID.pixelStartIndex; i<ID.dataArr.length; i++){
    if(ID.dataArr[i].length < 2){
      ID.dataArr[i] = '0'+ID.dataArr[i];
    }
  }

  // copy the dataArr into a temporary array, with pixel data only (no header data)
  const tempArr = [];
  for (let i = ID.pixelStartIndex; i < ID.dataArr.length; i++){
    tempArr.push(ID.dataArr[i]);
  }

  // turns all padding to 'x' to make it easier to handle
  if (ID.paddingCharsNeeded > 0){
    for(let i = ID.hexCharsPerRow; i <= tempArr.length; i+= ID.totalRowLength) {
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
  for (let i = 0; i < ID.rows; i++){
    // fill a single row array
    let rowArraySingles = [];
    for(let j = 0; j < ID.hexCharsPerRow; j++){
      let index = (i * ID.hexCharsPerRow) + j;
      rowArraySingles.push(tempArrNoPadding[index]);
    }

    // group the pixel data
    let rowArrayGrouped = [];
    for (let j = 0; j < rowArraySingles.length; j+= ID.bitsPerPixel / 8){
      let pixelRGB = '';
      if (ID.bitsPerPixel === 24){
        pixelRGB += rowArraySingles[j] + rowArraySingles[j+1] + rowArraySingles[j+2];
      } else if (ID.bitsPerPixel === 32){
        pixelRGB += rowArraySingles[j] + rowArraySingles[j+1] + rowArraySingles[j+2] + rowArraySingles[j+3];
      }

      rowArrayGrouped.push(pixelRGB);
    }
    // add to pixelData
    ID.pixelData.push(rowArrayGrouped);
  }
}


function makeHeader(){
  for (let i = 0; i < ID.pixelStartIndex; i ++){
    ID.headerData.push('0x' + ID.dataArr[i]);
  }
}

function addHexPreFix(arr){

  let joinedStr = arr.join();
  let joinedArr = joinedStr.split(',');

  const changedArr =[];

  for(let i = 0; i < joinedArr.length; i++){

    if(joinedArr[i] === 'x' ){
      changedArr.push('0x00');
    } else if (ID.bitsPerPixel === 24 ){
      changedArr.push('0x'+joinedArr[i][0]+joinedArr[i][1]);
      changedArr.push('0x'+joinedArr[i][2]+joinedArr[i][3]);
      changedArr.push('0x'+joinedArr[i][4]+joinedArr[i][5]);
    } else if (ID.bitsPerPixel === 32){
      changedArr.push('0x'+joinedArr[i][0]+joinedArr[i][1]);
      changedArr.push('0x'+joinedArr[i][2]+joinedArr[i][3]);
      changedArr.push('0x'+joinedArr[i][4]+joinedArr[i][5]);
      changedArr.push('0x'+joinedArr[i][6]+joinedArr[i][7]);
    }
  }
  return changedArr;
}

function swapRedBlue(arr){//is not working

  for(let i =0; i<arr.length; i++){
    // console.log(arr[i])
    if(arr[i] == 'ffffff'){
      //    console.log('true')
      arr[i] = '000000';
    }
    else if(arr[i] ==='000000'){
      arr[i] = 'ffffff';
    }
  }
  return arr;
}

function addPadding(array){
  if (ID.paddingCharsNeeded > 0){
    // for each row
    for (let i = 0; i < ID.rows; i++){
      for(let j = 0; j < ID.paddingCharsNeeded; j++){
        array[i].push('x');
      }
    }
  }
}

function addBorder(borderWidth){
  let imageWithBorder = ID.pixelData.slice();

  for (let y = 0; y < ID.rows; y++){
    for(let x = 0; x < ID.pixelData[0].length; x++){
      if(y < borderWidth || y > ID.rows-1-borderWidth){
        imageWithBorder[y][x] = '0000ff';
      }
      if(x < borderWidth || x > ID.pixelData[0].length-1-borderWidth){
        imageWithBorder[y][x] = '0000ff';
      }
    }
  }
  return imageWithBorder;
}

function blueWash(){
  //this line copies the original image array.
  let blueImage = ID.pixelData.slice();

  for (let y = 0; y < 110; y++){
    for(let x = 0; x < 125; x++){
      
      let blue = blueImage[x][y].replace(/../s, 'ff');
      blueImage[x][y] = blue;
    }
  }
  return blueImage;
}

function invert(){
  let inversion = ID.pixelData.slice();
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
  return inversion;
}


let ID = {};

readFile('./assets/24bit.bmp')
  .then( (data, error) => {
  // global variables
    ID.dataArrAscii = [];
    ID.pixelData = [];
    ID.headerData = [];
    ID.dataArr = [];
    ID.pixelStartIndex = 0;
    ID.width = 0;
    ID.height = 0;
    ID.bitsPerPixel = 0;

    ID.hexCharsPerRow = 0;
    ID.paddingCharsNeeded = 0;
    ID.totalRowLength = 0;
    ID.rows = 0;

  
    // put ALL data in hexidecmial format
    for (let i = 0; i < data.length; i++){
      ID.dataArr.push(data[i].toString(16));
    }

    for(let i = 0; i < ID.dataArr.length; i++){
    // console.log(`${i}: ${ID.dataArr[i]}`);
    }
  
    // ~~~~~~~~~~~~~~~~~~~~~~~~
    // header info
    // ~~~~~~~~~~~~~~~~~~~~~~~~
    for (let i = 0; i < 2; i++){
      let ascidata = String.fromCharCode(parseInt(ID.dataArr[i],16));
      ID.dataArrAscii.push(ascidata);
    }
    ID.headerTitle = ID.dataArrAscii.join('');
    if (ID.headerTitle === 'BM'){
      ID.pixelStartIndex = parseInt(ID.dataArr[10], 16);

      // width
      ID.width = parseInt(ID.dataArr[18], 16);
    
      // height
      ID.height = parseInt(ID.dataArr[22], 16); // header data is wrong

      // bitsPerPixel
      ID.bitsPerPixel = parseInt(ID.dataArr[28], 16);
      ID.hexCharsPerRow = ID.width * (ID.bitsPerPixel/8);  // 330 for test image
      ID.paddingCharsNeeded = ID.hexCharsPerRow % 4;    // 2 for test image
      ID.totalRowLength = ID.hexCharsPerRow + ID.paddingCharsNeeded; // 332 for test image
      ID.rows = (ID.dataArr.length - ID.pixelStartIndex) / ID.totalRowLength;
    }
    // ~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~~~~~~~~~~


    // format:
    // [
    //    [ffffff, ffffff, ... , ffffff],
    //    [ffffff, ffffff, ... , ffffff],
    //    [ffffff, ffffff, ... , ffffff],
    // ]
    pixelArrMaker();
    makeHeader();

    // transforms
    let transformedArray = [];
    //transformedArray = addBorder(5);
    //transformedArray = blueWash();
    transformedArray = invert();

    addPadding(transformedArray);
    transformedArray = addHexPreFix(transformedArray);
    let pixelDataBuffer = Buffer.from(transformedArray, 'hex');
    let headerDataBuffer = Buffer.from(ID.headerData, 16);
    let joinedImageBuffer = Buffer.concat([headerDataBuffer, pixelDataBuffer]);


    fs.writeFile('loopytest.bmp', joinedImageBuffer, function (err) {
      if (err) throw err;
    });

  } )
  .catch(error => console.log(error));




