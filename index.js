'use strict';

const fs = require('fs');
const buffer = require('buffer');

let bufferArray = [];

// Bitmap -- receives a file name, used in the transformer to note the new buffer
function Bitmap(filePath) {
  this.file = filePath;
  // this.file = '05-project/assets/24bit.bmp';
}

// Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
Bitmap.prototype.parse = function(buffer) {

  this.buffer = buffer;
  this.type = buffer.toString('hex', 0, 2);
  this.header = header(buffer);
 
  this.body = arrayify(buffer);
  console.log(this.body);
 
};

// Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
Bitmap.prototype.transform = function(operation) {
  // This is really assumptive and unsafe
  console.log(operation)
  transforms[operation](this);
  this.newFile =`./assets/baldy.greyscale.bmp`;
};

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 */
const transformGreyscale = (bmp) => {

  console.log('Transforming bitmap into greyscale', bmp);
  //console.log(bmp.body);
  let headStr = bmp.header.join(' ');
  let headbuff = Buffer.from(headStr);
  let bodyStr = bmp.body.join(' ');
  let bodybuff = Buffer.from(bodyStr);
  // console.log('head: ',headbuff);
  // console.log({bodybuff});
  let test = Buffer.from('1');
  console.log('test' ,test);

  bmp.concatbuff = Buffer.concat([headbuff, bodybuff], (headbuff.length + bodybuff.length), 'hex');
  //console.log('bmp concat buff', bmp.concatbuff);

  //TODO: Figure out a way to validate that the bmp instance is actually valid before trying to transform it

  //TODO: alter bmp to make the image greyscale ...

};

const doTheInversion = (bmp) => {
  bmp = {};
};



/**
 * A dictionary of transformations
 * Each property represents a transformation that someone could enter on the command line and then a function that would be called on the bitmap to do this job
 */
const transforms = {
  greyscale: transformGreyscale,
  invert: doTheInversion,
};

// ------------------ GET TO WORK ------------------- //


function transformWithCallbacks() {

  fs.readFile(file, (err, buffer) => {

    if (err) {
      throw err;
    }

    console.log('buffer',buffer);
    //bitmap.parse(buffer);
    bitmap.parse(buffer);

    bitmap.transform(operation);

    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    fs.writeFile(bitmap.newFile, bitmap.concatbuff, (err, out) => {
      if (err) {
        throw err;
      }
      console.log(bitmap.concatbuff);
      console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    });

  });
}
// TODO: Explain how this works (in your README)
const [file, operation] = process.argv.slice(2);

let bitmap = new Bitmap(file);


function arrayify(data){
  let bufferArray = [];
  for(let i = 54; i < data.length; i++){
    bufferArray.push(data[i].toString(16));
  } 
  return bufferArray;
}

function header(data){
  let headerArray = [];
  for(let i = 0; i < 53; i++){
    headerArray.push(data[i].toString(16));
  }
  return headerArray;
}


transformWithCallbacks();
