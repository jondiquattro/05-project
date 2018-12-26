'use strict';

const fs = require('fs');
const util = require("util");
const readFile = util.promisify(fs.readFile);

// const fileData3;
var streamArr =[]

readFile("./assets/24bit.bmp")
 .then( (data, error) => {

  // put ALL data in hexidecmial format
  const dataArr = [];
  for (let i = 0; i < data.length; i++){
    dataArr.push(data[i].toString(16));
  }

  // extract header 2-character string
  const dataArrAscii = []
  for (let i = 0; i < 2; i++){
    let ascidata = String.fromCharCode(parseInt(dataArr[i],16));
    dataArrAscii.push(ascidata);
  }
  let headerTitle = dataArrAscii.join('');

  // pixel data starts at index 54, put this in an array
  const pixelData = []
  for (let i = 39; i < dataArr.length; i++){
    pixelData.push(dataArr[i]);
  }

  // set all pixels to white => '0xff', or black '0x00', or gray '0x88'
  for (let i =  0; i < pixelData.length; i++){
    pixelData[i] = '0xff';
  }

  // change this new array into a buffer.
  // Let 'Buffer.from' know that we're using hex: 'hex' or 16
  let dataBufferNew = Buffer.from(pixelData, 'hex');

  // separately put the header data into an array, as is
  let headerData = [];
  for (let i = 0; i < 54; i ++){
    headerData.push('0x' + dataArr[i]);
  }

  // make a buffer out of the header data
  // Let 'Buffer.from' know that we're using hex: 'hex' or 16
  let headerDataBuffer = Buffer.from(headerData, 16);

  // concat the changed pixel data with the old header data
  let newBufferData = Buffer.concat([headerDataBuffer, dataBufferNew]);

   fs.writeFile('loopytest4.bmp', newBufferData, function (err) {
       if (err) throw err;
     });

 } )
 .catch(error => console.log(error));