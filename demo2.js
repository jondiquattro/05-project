'use strict';

const fs = require('fs');
const util = require("util");
const readFile = util.promisify(fs.readFile);

// const fileData3;
var streamArr =[]


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
    // for(let i = hexCharsPerRow; i <= tempArr.length; i+= totalRowLength) {
    //   tempArr[i] = 'x';
    //   tempArr[i+1] = 'x';
    // }

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
  // console.log(ID.pixelData);
}


function makeHeader(){
  for (let i = 0; i < ID.pixelStartIndex; i ++){
      ID.headerData.push('0x' + ID.dataArr[i]);
  }
  // console.log(headArr)
}

function addHexPreFix(){

  let arr = ID.pixelData;
  let joinedStr = arr.join();
  let joinedArr = joinedStr.split(',');

  // console.log({joinedArr});
  console.log('--------- ADDING HEX PREFIX -----------');
  console.log(`joinedArr.length: ${joinedArr.length}`);
  const changedArr =[];

  //14,000 elements
  // 125 rows of 100 elements, + 2 elements on the end
  // 112 * 125 = 14000
  // 110 * 3 = 330 elements , * 125 rows = 41250 elements
  // padding is 2 elements per row, * 125 rows = 250 elements
  // total is 41500 elements

  for(let i = 0; i < joinedArr.length; i++){

    if(joinedArr[i] === 'x' ){
      // changedArr.push('0x00');
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

  // console.log(`changedArr.length: ${changedArr.length}`);
  // for (let i = changedArr.length-5; i < changedArr.length; i++){
  //   console.log(`changedArr[${i}]: ${changedArr[i]}`);
  // }

  // for (let i = changedArr.length-332-5; i < changedArr.length-332; i++){
  //   console.log(`changedArr[${i}]: ${changedArr[i]}`);
  // }

  // for (let i = 0; i < 5; i++){
  //   console.log(`changedArr[${i}]: ${changedArr[i]}`);
  // }

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
            arr[i] = 'ffffff'
        }
    }
    return arr;
}

function invert(arr){
  //console.log(arr);
  for(let i = 0; i < arr.length; i++){
      let inverted = parseInt('ff', 16) - parseInt(arr[i], 16);
      arr[i]= inverted.toString(16);
      if(i < 200){
         // console.log(arr[i]);
      }
  }
}


let ID = {};

readFile("./assets/24bit.bmp")
 .then( (data, error) => {
  // global variables
  ID.dataArrAscii = []
  ID.pixelData = []
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
    // console.log(`ID.hexCharsPerRow: ${ID.hexCharsPerRow}`);
    // console.log(`ID.rows: ${ID.rows}`);
  }


  // ~~~~~~~~~~~~~~~~~~~~~~~~
  // ~~~~~~~~~~~~~~~~~~~~~~~~

  console.log(`ID.dataArr.length: ${ID.dataArr.length}`);
  console.log(`ID.pixelStartIndex: ${ID.pixelStartIndex}`);
  console.log(`ID.dataArr.length - ID.pixelStartIndex: ${ID.dataArr.length - ID.pixelStartIndex}`);
  console.log(`ID.hexCharsPerRow: ${ID.hexCharsPerRow}`);
  console.log(`ID.width: ${ID.width}`);
  console.log(`ID.height: ${ID.height}`);
  console.log(`ID.bitsPerPixel: ${ID.bitsPerPixel}`);
  console.log(`ID.rows: ${ID.rows}`);
  // format:
  // [
  //    [ffffff, ffffff, ... , ffffff],
  //    [ffffff, ffffff, ... , ffffff],
  //    [ffffff, ffffff, ... , ffffff],
  // ]
  pixelArrMaker();
  console.log(`1 ID.pixelData.length: ${ID.pixelData.length}`);

  makeHeader();
  console.log(`ID.headerData.length: ${ID.headerData.length}`);

  let borderWidth = 1;
  // let imageWithBorder = addBorder(pixelData, borderWidth, width, bitsPerPixel);
  addPadding();
  console.log(`2 ID.pixelData.length: ${ID.pixelData.length}`);

  let arrayWithHexPrefix = addHexPreFix();
  console.log(`arrayWithHexPrefix.length: ${arrayWithHexPrefix.length}`);

  let pixelDataBuffer = Buffer.from(arrayWithHexPrefix, 'hex');
  console.log(`pixelDataBuffer.length: ${pixelDataBuffer.length}`);
  
  let headerDataBuffer = Buffer.from(ID.headerData, 16);
  console.log(`headerDataBuffer.length: ${headerDataBuffer.length}`);
  console.log('~~~~~~');
  // for (let i = 0; i < headerDataBuffer.length; i++){
  //   console.log(headerDataBuffer[i].toString(16));
  // }

  let joinedImageBuffer = Buffer.concat([headerDataBuffer, pixelDataBuffer]);
  console.log(`joinedImageBuffer.length: ${joinedImageBuffer.length}`);
  console.log('~~~~~~');
  // console.log(joinedImageBuffer);
  // for (let i = 0; i < joinedImageBuffer.length; i++){
  //   console.log(joinedImageBuffer[i].toString(16));
  // }

   fs.writeFile('loopytest.bmp', joinedImageBuffer, function (err) {
       if (err) throw err;
     });

 } )
 .catch(error => console.log(error));


 function addBorder(pixelData, borderWidth){
  
  for (let i = 0; i < pixelData.length; i++){
    // console.log(pixelData[i]);
  }

  let imageWithBorder = [];
  let width = 110;
  let height = 125;


  // console.log('pixelData.length: ', pixelData.length);
  
  //for each row (height)
  for (let i = 0; i < pixelData.length; i++){

    let row = [];

    // for each pixel in the row (width)
    for (let j = 0; j < pixelData[i].length; j++){
      row[j] = pixelData[i][j];
      // if (i < borderWidth || i > height-borderWidth){
      //   imageWithBorder[width*i + j] = '0000ff';
      // }
      // // set L / R border
      // if (j < borderWidth || j > width-borderWidth){
      //   imageWithBorder[width*i + j] = '0000ff';
      // }
    }
    imageWithBorder.push(row);
  }
  // console.log({imageWithBorder});
  // for (let i = 0; i < imageWithBorder.length; i++){
  //   console.log(imageWithBorder[i]);
  // }
  return imageWithBorder;
 }


 function addPadding(){
  console.log(`ID.paddingCharsNeeded: ${ID.paddingCharsNeeded}`);
  console.log(`Before padding: ID.pixelData[0].length: ${ID.pixelData[0].length}`);
  if (ID.paddingCharsNeeded > 0){

    // for each row
    for (let i = 0; i < ID.rows; i++){
      for(let j = 0; j < ID.paddingCharsNeeded; j++){
        ID.pixelData[i].push('x');
      }
    }
  }

  console.log(`After padding: ID.pixelData[0].length: ${ID.pixelData[0].length}`);
  // console.log(`-1: ${ID.pixelData[0][ID.pixelData[0].length-1]}`);
  // console.log(`-2: ${ID.pixelData[0][ID.pixelData[0].length-2]}`);
  // console.log(`-3: ${ID.pixelData[0][ID.pixelData[0].length-3]}`);
 }