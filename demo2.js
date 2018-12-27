'use strict';

const fs = require('fs');
const util = require("util");
const readFile = util.promisify(fs.readFile);

// const fileData3;
var streamArr =[]


//helpers
function pixelArrMaker(dataArr, pixelData, pixelStartIndex){
    // console.log(dataArr)
    for(let i = pixelStartIndex+1; i<dataArr.length; i++){
        if(dataArr[i].length < 2){
            dataArr[i] = '0'+dataArr[i];
        } 
    }
    // console.log(dataArr.length)
    for(let j = pixelStartIndex+1; j<dataArr.length; j+=3){
        pixelData.push(dataArr[j].concat(dataArr[j+1], dataArr[j+2]))
    }
}


function makeHeader(headArr, dataArr, pixelStartIndex){
    for (let i = 0; i <= pixelStartIndex; i ++){
        headArr.push('0x' + dataArr[i]);
      }
      // console.log(headArr)
}

function addHexPreFix(arr){
    const changedArr =[];
    arr.forEach( (idx)=>{

        if(idx[4]!== 'u'){
            changedArr.push('0x'+idx[0]+idx[1]);
            changedArr.push('0x'+idx[2]+idx[3]);
            changedArr.push('0x'+idx[4]+idx[5])
        }

    })
    // console.log('from add prefix',changedArr);
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

readFile("./assets/24bit.bmp")
 .then( (data, error) => {
  const dataArrAscii = []
  const pixelData = []
  const headerData = [];
  const dataArr = [];
  let pixelStartIndex = 0;



  for (let i = 0; i < data.length; i++){
    dataArr.push(data[i].toString(16));
  }


  for (let i = 0; i < 2; i++){
    let ascidata = String.fromCharCode(parseInt(dataArr[i],16));
    dataArrAscii.push(ascidata);
  }
  let headerTitle = dataArrAscii.join('');
  if (headerTitle === 'BM'){
    pixelStartIndex += 14;

    const pixelOffsetFromHeader = [];
    for (let i = 11; i < 15; i++){
      pixelOffsetFromHeader.push(dataArr[i]);
    }
    let offsetString = pixelOffsetFromHeader.join('');
    let offsetNum = parseInt(offsetString, 16);
    pixelStartIndex += offsetNum;
  }

  // let pixelStartIndex = ;
  console.log({pixelStartIndex});
  console.log({headerTitle});


  pixelArrMaker(dataArr,pixelData, pixelStartIndex);

  makeHeader(headerData,dataArr, pixelStartIndex);
  console.log(headerData);
  console.log(pixelData);
    // addHexPreFix(swapRedBlue(pixelData))
//   console.log(pixelData);

//   console.log('swap pixels ',swapRedBlue(pixelData))
// console.log(pixelData)

  let dataBufferNew = Buffer.from(addHexPreFix(pixelData), 'hex');
  console.log({dataBufferNew});
  let headerDataBuffer = Buffer.from(headerData, 16);
  console.log({headerDataBuffer});
  let newBufferData = Buffer.concat([headerDataBuffer, dataBufferNew]);
  console.log({newBufferData});
  for (let i = 0; i < newBufferData.length; i++){
    console.log(newBufferData[i]);
  }

   fs.writeFile('loopytest.bmp', newBufferData, function (err) {
       if (err) throw err;
     });

 } )
 .catch(error => console.log(error));