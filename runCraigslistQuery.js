// import axios from 'axios'
const axios = require('axios');
var htmlparser = require("htmlparser2");
// import url from 'url-parse'
const fs = require('fs');

const buildUrl = (props) => {
    var s = ''
    s += props.protocol
    s += props.city
    s += '.'
    s += props.domain
    s += '/search/apa?'
    if(props.query) s += `query=${props.query}&`
    if(props.max_price) s += `max_price=${props.max_price}&`
    if(props.min_bedrooms) s += `min_bedrooms=${props.min_bedrooms}&`
    if(props.min_bathrooms) s += `min_bathrooms=${props.min_bathrooms}&`
    if(props.shousing_type) {
        props.shousing_type.forEach((o) => {
            s += `housing_type=${o}&`
        })
    }
    if(props.sale_date) s += `sale_date=${props.sale_date}`
    return s
}

const getResults = async () => {
  try {
    const urlProperties = {
        protocol:'https://',
        city: 'vancouver',
        domain:'craigslist.org',
        query: 'full+house',
        max_price: '4000',
        min_bedrooms: '2',
        min_bathrooms: '2',
        availabilityMode: '0',
        housing_type: [6,9],
        sale_date: 'all+dates'
    }
    const url = buildUrl(urlProperties);
    console.log('URL = ',url)
    const response = await axios.get(url);
    // console.log('RESPONSE', response);
    // console.log(response.data)
    let startParse = false;
    var isImage = false;
    var isDate = false;
    var isPrice = false;
    var isHousing = false;
    var isHood = false;
    var isLink = false;
    var results = [];
    var data = {};
    var debug = ''
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs){
            // console.log('Name - ',name)
            // console.log('attribs - ', attribs)
            // debug += `Name - ${name}\nAttribs - ${JSON.stringify(attribs)}\n\n\n`
            if(name === 'li' && attribs.class ==='result-row'){
                data = {};
                startParse = true
                // console.log('')
            }
            // if(name === "p" && attribs.class === 'result-info'){
            //     // console.log('OnOpen - Name - ', name, 'attribs.class - ', attribs.class)
            //     // isResultInfo = true;

            //     // <a href="https://vancouver.craigslist.org/nvn/apa/d/north-vancouver-orcaref3656gcharming-5/6818834669.html" data-id="6818834669" class="result-title hdrlnk">(ORCA_REF#3656G)***CHARMING 5 BEDROOM HOME IN THE HEART OF EDGEMONT***</a>
            //     // <span class="result-price">$3575</span>
            //     // <span class="housing">
            //     //    5br -
            //     //    2000ft<sup>2</sup> -
            //     // </span>
            //     // <span class="result-hood"> (EDGEMONT/FOREST HILLS)</span>
            // }
            if(name === 'time' && attribs.class === 'result-date'){
                isDate = true
            }
            if(name === 'span' && attribs.class === 'result-price'){
                isPrice = true
            }
            if(name === 'span' && attribs.class === 'housing'){
                isHousing = true
            }
            if(name === 'span' && attribs.class === 'result-hood'){
                isHood = true
            }
            if(name === 'a' && attribs.class === 'result-title hdrlnk'){
                isLink = true
                // console.log('HREF -->', attribs.href)
                data.url = attribs.href
            }
            
            if(name === 'a' && attribs.class === 'result-image gallery'){
                // console.log('Name - ', name, 'Attribs - ', attribs)
                let imageDataIdsString = attribs[`data-ids`]
                // console.log('imageDataIdsString  - ', imageDataIdsString)
                let imageDataIdsArray = imageDataIdsString.split(',')
                let imageDataId = imageDataIdsArray[0].substr(2)
                // console.log('imageDataId - ',imageDataId)
                data.imageUrl = `https://images.craigslist.org/${imageDataId}_300x300.jpg`
            }
        },
        ontext: function(text){
            // console.log('-->',text)
            if(startParse){
                if(isImage){
                    // console.log("Image -->", text)
                    data.image = text
                }
                if(isDate){
                    // console.log("Date -->", text);
                    data.date = text
                }
                if(isPrice){
                    // console.log("Price -->", text);
                    data.price = text
                }
                if(isHousing){
                    // console.log("Housing -->", text);
                    data.housingType = text.replace(/[^A-Za-z0-9]/ig, "").trim()
                    // data.housingType = text.replace(/[\n\r]/g, "").trim()
                    // data.housingType = text.replace(/ +(?= )/g,'');
                }
                if(isHood){
                    // console.log("Hood -->", text);
                    data.hood = text
                }
                if(isLink){
                    // console.log("Link -->", text);
                    data.linkText = text
                }
            }
        },
        onclosetag: function(tagname){
            // debug += `OnCloseTage - ${tagname}\n\n\n`

            // if(tagname === 'img'){
            //     isImage = false
            // }
            if(tagname === 'time'){
                isDate = false
            }
            if(tagname === 'span'){
                isPrice = false;
                isHousing = false;
                isHood = false;
            }
            if(tagname === 'a'){
                isLink = false
            }
            if(tagname === "li"){
                startParse = false;
                // console.log('data - ', data)
                results.push(data)

            }
        },
    }, {decodeEntities: true, recognizeSelfClosing: true, xmlMode: true});
    parser.write(response.data);
    parser.end();
    var resultsFiltered = results.filter(value => Object.keys(value).length !== 0);
    fs.writeFile("//mnt/c/Projects/craiglist-bot/debug.txt", JSON.stringify(resultsFiltered), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 

    // console.log('Results', results)
  } catch (error) {
    console.error(error);
  }
}

getResults()

//  https://vancouver.craigslist.org/search/apa?max_price=4000&min_bedrooms=2&min_bathrooms=2&availabilityMode=0&housing_type=6&housing_type=9&sale_date=all+dates
//  https://vancouver.craigslist.org/search/apa?query=full+house&max_price=4000&min_bedrooms=2&min_bathrooms=2&availabilityMode=0&housing_type=6&housing_type=9&sale_date=all+dates
//     protocol: The protocol scheme of the URL (e.g. http:).
//     slashes: A boolean which indicates whether the protocol is followed by two forward slashes (//).
//     auth: Authentication information portion (e.g. username:password).
//     username: Username of basic authentication.
//     password: Password of basic authentication.
//     host: Host name with port number.
//     hostname: Host name without port number.
//     port: Optional port number.
//     pathname: URL path.
//     query: Parsed object containing query string, unless parsing is set to false.
//     hash: The "fragment" portion of the URL including the pound-sign (#).
//     href: The full URL.
//     origin: The origin of the URL.