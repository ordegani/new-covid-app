//create obj or arr for arrays and obj for country*continent, chosen (preferably objects)
//currents
//chart
//use debugger
//https://www.youtube.com/watch?v=vFHQOUn4ie4&feature=youtu.be
//https://stackoverflow.com/questions/62940174/create-bar-chart-with-chart-js-where-space-per-bar-is-the-same-overall-chart-si

let countriesByContinents = {};
let currentCode = {};
let currentContinent = 'All';
let currentOption = 'cases';
let myChart;
const proxy = `https://cors-anywhere.herokuapp.com/`;
//debugger;


function getinfo(info){
    let myXlabel = [];
    for(let i = 0; i<currentCode.length ; i++){
        myXlabel.push(currentCode[i][info]);
    }
    return myXlabel;
}

function getlabel(){
    return `${currentContinent} ${currentOption}`;
}



function render(){
    if(myChart != null)
    {
        myChart.destroy();
    }
    
    const ctx = document.getElementById('myChart').getContext('2d');
    let xLabel= getinfo("name");
    let yLabel= getinfo(currentOption);


  //https://stackoverflow.com/questions/62940174/create-bar-chart-with-chart-js-where-space-per-bar-is-the-same-overall-chart-si
    
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: xLabel ,
        datasets: [{
            label: getlabel(),
            data: yLabel,
            backgroundColor: [
                'rgba(255, 200, 132, 0.2)',
            ],
            borderColor: [
                'rgba(255, 200, 132, 1)',
            ],
            borderWidth: 1,
        }]
    },
    options: {
        aspectRatio:3,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});

}

function addLoading(){
    const loading = document.querySelector('.loading');
    loading.classList.add('add-loading');
}

function removeLoading(){
    const loading = document.querySelector('.loading');
    loading.classList.remove('add-loading');
}

async function connectWithApi(api) {
    addLoading();
    const response = await fetch(`${api}`);
    if(response.status !== 200){
        throw 400; 
    }
    const data = await response.json();
    removeLoading();
    return data;
}

function createBoxInfo(title,info){
    const boxDiv = document.createElement('div');
    boxDiv.classList.add('infoCountry__box');
    const miniTitle = document.createElement('p');
    miniTitle.classList.add('mini-title');
    miniTitle.textContent = title;
    const coronaInfo = document.createElement('p');
    coronaInfo.textContent = info;

    boxDiv.appendChild(miniTitle);
    boxDiv.appendChild(coronaInfo);
    return boxDiv;
}

function setPInfo(countryObj){
    const countryInfoContainer = document.querySelector('.infoCountry');
    countryInfoContainer.innerHTML = '';
    countryInfoContainer.appendChild(createBoxInfo('Total cases',countryObj.cases));
    countryInfoContainer.appendChild(createBoxInfo('New cases',countryObj.todaycases));
    countryInfoContainer.appendChild(createBoxInfo('Total deaths',countryObj.deaths));
    countryInfoContainer.appendChild(createBoxInfo('New deaths',countryObj.todayDeaths));
    countryInfoContainer.appendChild(createBoxInfo('Total recovered',countryObj.recovered));
    countryInfoContainer.appendChild(createBoxInfo('Critical',countryObj.critical));
    countryInfoContainer.classList.add('show');
}


function createPElemenet(countryObj){
    const pElement = document.createElement('p');
    pElement.classList.add('p-class');
    pElement.textContent = countryObj.name;
    pElement.addEventListener('click',function(){
        setPInfo(countryObj);
    })
    return pElement;
}

function updateInfo(){
    const linkContainer = document.querySelector('.container-countries');
    linkContainer.innerHTML = ""
    for(let i =0; i< currentCode.length ; i++){
        linkContainer.appendChild(createPElemenet(currentCode[i]));
    }

}


function renderCountriesFromContinent(){
    updateInfo();
    render();
}

async function findInfoCovidApi(code){

    const covidApiInfo = await getCovidData(code);
    try{
        currentCode.push({
            code:code,
            name:covidApiInfo.data.name,
            population: covidApiInfo.data.population,
            cases: covidApiInfo.data.latest_data.cases,
            critical: covidApiInfo.data.latest_data.critical,
            deaths: covidApiInfo.data.latest_data.deaths,
            recovered: covidApiInfo.data.latest_data.recovered,
            todaycases: covidApiInfo.data.today.cases,
            todayDeaths: covidApiInfo.data.today.deaths,
        });
    }
    catch{
        console.log('[ERROR]');
    }  
}

async function getCountriesInfo(){
    let countryArr;
    if(currentContinent === 'All'){
        countryArr = Object.keys(countriesByContinents);
    }
    else{
        countryArr = currentContinent.split(' ');
    }
    currentCode = [];
    
    for(const country of countryArr ){
        for(const i of countriesByContinents[country]){
            await findInfoCovidApi(i);
        }
    }
    renderCountriesFromContinent();
}
function removeShowClass(){
    const countryInfoContainer = document.querySelector('.infoCountry');
    countryInfoContainer.classList.remove('show');
}

function changeCurrentContinent(event){
    currentContinent = event.currentTarget.textContent;
    removeShowClass();
    getCountriesInfo();
}

function btnEventListner(){
    const buttons = document.querySelectorAll('.btn-continent');
    for(let i = 0;i< buttons.length; i++){
        buttons[i].addEventListener('click',changeCurrentContinent);
    }
}

function renderButtons(){
    const btnConatiner = document.querySelector('.conatiner-continent');
    for(const key in countriesByContinents){
        const btn = document.createElement('button');
        btn.classList.add('btn-continent')
        btn.textContent = key;
        btnConatiner.appendChild(btn);
    }
    getCountriesInfo();
    btnEventListner();

}
////////////////////////////////
function addEventBtnSelector(){
    
    const btnSelector = document.querySelectorAll('.option-btn-selector');
    for(let i = 0; i<btnSelector.length;i++){
        btnSelector[i].addEventListener('click',function(event){
            currentOption = event.currentTarget.textContent;
            removeShowClass();
            getCountriesInfo();
        })
    }
}

function removeOthers(){
    delete countriesByContinents[''];
}

//country*continent (by first 2 letters country code)
function enteringInformationByContinents(data){
    for(const i of data){
        
        if(countriesByContinents.hasOwnProperty(i.region)){
            countriesByContinents[i.region].push(i.cca2);
        }
        else{
            countriesByContinents[i.region] = [];
            countriesByContinents[i.region].push(i.cca2);
        }
    }
    removeOthers();
    renderButtons();
}

async function getCovidData(country) {
    
    try{
        const data = await connectWithApi(`https://corona-api.com/countries/${country}`);
        return data;
    }
    catch{
        console.log("[ERROR] unable get the API");
    }
    

}
//debuggger;
async function getContinentData() {
    try{
        const data = await connectWithApi(`${proxy}https://restcountries.herokuapp.com/api/v1`);
        enteringInformationByContinents(data);
    }
    catch{
        console.log("[ERROR] unable get the API");
    }

}
////////////////////////

async function availableLocalStorge(){
    if(localStorage.getItem("objCountries") === null){
        await getContinentData();
        localStorage.setItem("objCountries",JSON.stringify(countriesByContinents));
    }
    else{
        countriesByContinents = JSON.parse(localStorage.getItem('objCountries'));
        renderButtons();
    }
}


availableLocalStorge();
addEventBtnSelector();
