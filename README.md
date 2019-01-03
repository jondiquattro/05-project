![CF](http://i.imgur.com/7v5ASc8.png) LAB
=================================================

## Project Name

### Authors: Jon Diquattro, Caity Heath, Fletcher LaRue

### Links and Resources
* [repo](https://github.com/jondiquattro/05-project)
* [travis](https://www.travis-ci.com/jondiquattro/05-project)
* [heroku](https://dashboard.heroku.com/apps/lab-05-diquattro) 

### Setup
* Clone the repository 
  * `git clone https://github.com/jondiquattro/05-project.git`

* Run from the command line `npm i ` which will install the following dependencies 
  * buffer 
  * eslint 
  * jest


#### Running the app
* `node index assets/24bit.bmp [operation](paramA, paramB, paramC);`
  * Returns an image file with the name `24bit.[operation].bmp`

###Transformation commands
* Border takes 2 parameters width(integer) and color. It adds a border to the outside of the image. 
  * `node index assets/24bit.bmp border 10 black`
* Invert doesn't take any parameters. It is a negative of the original image.
  * `node index assets/24bit.bmp invert`
* Blue filter doesn't take any parameters. It gives blue value to all of the pixels.
  * `node index assets/24bit.bmp blueWash`
* Edge detection doesn't take any parameters, it add a blue border around John's head. 
  * `node index assets/24bit.bmp edge`
* Hair takes 2 parameters: Age(integer) and Color(random). Either can be omitted. This transform give John hair!
  * `node index assets/24bit.bmp hair 20`
  * `node index assets/24bit.bmp hair 20 black`


#### Tests
Tests have yet to be written.


#### Image details
110 pixels Height x 125 width
