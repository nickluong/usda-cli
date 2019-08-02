const csv = require('csvtojson') // converts csv file to json array
const inquirer = require('inquirer') // CLI prompts using inquirer

 var questions = [{
    type: 'input',
    name: 'name',
    message: "Welcome to the USDA Database CLI, Please type in the name of the Product. \n",
  }]
  
  inquirer.prompt(questions).then(answers => {
      //searchFunction(answers['name'].toUpperCase())
    })

async function searchFunction(searchString) {
    let result = [];

    //convert Products.csv file to JSON and filter down to only products with matching names
    let productArr = await csv().fromFile('./node_modules/USDA_Database/Products.csv').then(data => data.filter(product => product.long_name.includes(searchString)));
   
    //creates custom json object for each product in the results array
    productArr.forEach(product => result.push({"product_name": product.long_name, "NDB": product.NDB_Number, "Fats": '-', "Proteins": '-', "Carbs": '-' }))

    //array of NDB numbers for reference when accessing Nutrients.csv
    let numArr = result.map(result => result.NDB);
    
    //converts Nutrients.csv to JSON and filter down to only proteins/carbs/fats and have matching NDB numbers
    let nutrientsArr = await csv().fromFile('./node_modules/USDA_Database/Nutrients.csv').then(data => data.filter(nutrient => numArr.includes(nutrient.NDB_No) && (['203','204','205'].includes(nutrient.Nutrient_Code))));
    
    //iterates through all nutrients and places them under the matching json object in the result array
    nutrientsArr.forEach((nutrient) => {
        let obj = result.find((item) => item.NDB === nutrient.NDB_No)
        if(nutrient.Nutrient_Code === '204')
            obj.Fats = nutrient.Output_value
        else if(nutrient.Nutrient_Code === '205')
            obj.Proteins = nutrient.Output_value
        else 
            obj.Carbs = nutrient.Output_value
    }) 

    console.log(result)
}
