// init
pageSetup();

function pageSetup() {
    // setup the data
    var trailTitlesAndIDs = {"Tropics Trail": "tropics-trail", "South Entry" : "south-entry-trail", "Northern Trail" : "northern-trail", "Medtronic Minnesota Trail" : "mn-trail", "Russia's Grizzly Coast" : "grizzly-coast-trail", "Discovery Bay" : "discovery-bay-trail", "Wells Fargo Family Farm" : "farm-trail", "Wings Financial World of Birds Show" : "bird-show-trail"};

    // make the charts
    Object.keys(trailTitlesAndIDs).forEach(function(trail) {
        let title = trail;
        let target = trailTitlesAndIDs[trail];
        createSmBubbleChart(`#sm-${target}`, title);
        createLgBubbleChart(`#lg-${target}`, title);
        setPercentages(target, title);
    });
    var dotsImg = document.querySelector(".dots-image");

    dotsImg.animate([
        // keyframes
        { opacity: '0', transform: 'translateY(30px)'}, 
        { opacity: '1', transform: 'translateY(0px)'}
        ], { 
        // timing options
        duration: 1000, fill: 'forwards', delay: 200
    });
}

// creates the smaller bubble charts
function createSmBubbleChart(targetID, title) {
        var animalsList = animalsByTrail[title];

        const width = 300;
        const height = 200;

        let sectionLink = targetID.slice(4,targetID.length); // formats the url for the section link

        var target = document.querySelector(targetID);
        target.innerHTML += `<p><a href="#${sectionLink}">${title}</a></p>`;

        // make the responsive svg
        const svg = d3.select(targetID).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`) // viewbox has width 300, height 300

        // mammals, reptiles/amphibians, birds, fish - red, green, yellow, blue
        const roleScale = ['#B38D97', '#AAC49D', '#EAC988', '#90BBE5'];

        // map list of animals by trail to new data array
        let data = animalsList.map(function(animal) {
            let color = getColorIndex(animal.type);
            return { n: animal.name, c: color, r: 7 };
        });
        
        // set params for force layout
        const manyBody = d3.forceManyBody().strength(2);
        const center = d3.forceCenter().x((width/2)).y((height/2));
        
        // define force
        let force = d3.forceSimulation()
        .force('charge', manyBody)
        .force('center', center)
        .force('collision', d3.forceCollide(d => d.r + 2))
        .velocityDecay(.48)
        .nodes(data)
        .on('tick', changeNetwork);
        
        // make circles
        svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .style('fill', d => roleScale[d.c])
        .attr('r', d => d.r);
    }

// creates the larger bubble charts
function createLgBubbleChart(targetID, title) {
    var animalsList = animalsByTrail[title];
    if (title == "All Trails") animalsList = getAllAnimals(animalsByTrail);

    // addSingleTrailHTML(targetID, title);

    var animalNameTarget = targetID + "-animal";
    const circRadius = 20;

    var width = 1000;
    var height = chartHeight(animalsList.length);

    // make the responsive svg
    const svg = d3.select(targetID).append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 1000 ${height}`) // viewbox has width 1000, height 600

    // mammals, reptiles/amphibians, birds, fish - red, green, yellow, blue
    const roleScale = ['#B38D97', '#AAC49D', '#EAC988', '#90BBE5'];

    // map list of animals by trail to new data array
    let data = animalsList.map(function(animal) {
        let color = getColorIndex(animal.type);
        return { n: animal.name, c: color, r: circRadius };
    });
    
    // set params for force layout
    const manyBody = d3.forceManyBody().strength(2);
    const center = d3.forceCenter().x((width/2)).y((height/2));
    
    // define force
    let force = d3.forceSimulation()
        .force('charge', manyBody)
        .force('center', center)
        .force('collision', d3.forceCollide(d => d.r + 2))
        .velocityDecay(.48)
        .nodes(data)
        .on('tick', changeNetwork)
    
    // make the circles
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .style('fill', d => roleScale[d.c])
        .attr('r', d => d.r)
        .on('mouseover', function(d,i) {
            var nameTarget = document.querySelector(`${animalNameTarget} h4`);
            nameTarget.innerText = d.n;
            nameTarget.style.opacity = 1;
        })
        .on('mouseout', function(d, i) {
            var nameTarget = document.querySelector(`${animalNameTarget} h4`);
            nameTarget.style.opacity = 0;
        })
        .on('click', function(d, i) {
            var animalName = d.n;
            window.open(`https://en.wikipedia.org/w/index.php?search=${animalName}`);
            // https://en.wikipedia.org/index.php?search=
        })
}

// sets the height of the chart based on the amount of nodes
function chartHeight(numNodes) {
    switch(true) {
        case numNodes > 150:
            return 800;
        case numNodes > 100:
            return 600;
        case numNodes > 30:
            return 400;
        default: 
            return 300;
    }
}

// sets the percentages for a large chart
function setPercentages(target, title) {
    var animalsList = animalsByTrail[title];
    var animalsAndPercentages = {};

    animalsList.forEach(function(animal) {
        if(animalsAndPercentages[animal.type]) {
                animalsAndPercentages[animal.type]++;
            } else {
                animalsAndPercentages[animal.type] = 1;
            }
        });

    var totalSpecies = 0;
    Object.keys(animalsAndPercentages).forEach(animalType => {
        totalSpecies += animalsAndPercentages[animalType];
    });
    Object.keys(animalsAndPercentages).forEach(function(animalType) {
        animalsAndPercentages[animalType] = Math.floor(100 * (animalsAndPercentages[animalType] / totalSpecies));
    });

    var mammalsStatTarget = document.querySelector(`#${target} .mammals-percentage`);
    mammalsStatTarget.innerHTML = `${animalsAndPercentages["Mammals"] || 0}%<br>Mammal Species`;

    var birdsStatTarget = document.querySelector(`#${target} .birds-percentage`);
    birdsStatTarget.innerHTML = `${animalsAndPercentages["Birds"] || 0}%<br>Bird Species`;

    var reptsAmphsStatTarget = document.querySelector(`#${target} .repts-amphs-percentage`);
    reptsAmphsStatTarget.innerHTML = `${animalsAndPercentages["Amphibian/Reptile"] || 0}%<br>Reptile & Amphibian Species`;

    var fishStatTarget = document.querySelector(`#${target} .fish-percentage`);
    fishStatTarget.innerHTML = `${animalsAndPercentages["Fish"] || 0}%<br>Fish Species`;
}

// uses the animalsByTrail structure to get all animals
function getAllAnimals(animalsByTrail) {
    var allAnimals = [];
    Object.keys(animalsByTrail).forEach(function(key) {
        animalsByTrail[key].forEach(function(animal) {
            allAnimals.push(animal);
        });
    });
    return allAnimals;
}

// setting x and y
function changeNetwork() {
    d3.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
}

// takes in animal type and returns corresp. index in colors array
function getColorIndex(typeStr) {
    let colorIndex = 0;
    switch(typeStr) {
        case "Mammals":
            colorIndex = 0;
            break;
        case "Amphibian/Reptile":
            colorIndex = 1;
            break;
        case "Birds":
            colorIndex = 2;
            break;
        case "Fish":
            colorIndex = 3;
            break;
    }
    return colorIndex;
}

